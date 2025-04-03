import { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaUserShield, FaUserAlt, FaTrash, FaExclamationTriangle } from 'react-icons/fa';
import { userAPI } from '../../utils/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { toast } from 'react-toastify';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [processingId, setProcessingId] = useState(null);

  const fetchUsers = async (page = 1, filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page,
        limit: 10,
        ...filters
      };
      
      const response = await userAPI.getAllUsers(params);
      setUsers(response.data.data);
      setTotalPages(Math.ceil(response.data.total / response.data.limit));
      setCurrentPage(response.data.page);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filters = {};
    
    if (searchTerm) {
      filters.search = searchTerm;
    }
    
    if (roleFilter !== 'all') {
      filters.role = roleFilter;
    }
    
    fetchUsers(currentPage, filters);
  }, [currentPage, searchTerm, roleFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      return;
    }

    try {
      setProcessingId(userId);
      await userAPI.updateUser(userId, { role: newRole });
      
      // Update the user in the state
      setUsers(users.map(user => 
        user._id === userId 
          ? { ...user, role: newRole } 
          : user
      ));
      
      toast.success(`User role updated to ${newRole}`);
    } catch (err) {
      console.error('Error updating user role:', err);
      const errorMessage = err.response?.data?.message || 'Failed to update user role';
      toast.error(errorMessage);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      setProcessingId(userId);
      await userAPI.deleteUser(userId);
      
      // Remove the user from the state
      setUsers(users.filter(user => user._id !== userId));
      
      toast.success('User deleted successfully');
    } catch (err) {
      console.error('Error deleting user:', err);
      const errorMessage = err.response?.data?.message || 'Failed to delete user';
      toast.error(errorMessage);
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center py-12">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center py-8">
              <div className="text-red-500 mb-4">
                <FaExclamationTriangle size={48} className="mx-auto" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Error Loading Users</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button 
                onClick={() => fetchUsers(currentPage)}
                className="btn btn-primary"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Manage Users</h1>
        
        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <div className="flex-1">
              <form onSubmit={handleSearch}>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="search"
                    placeholder="Search by name or email"
                    className="input pr-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <FaUser className="text-gray-400" />
                  </button>
                </div>
              </form>
            </div>
            
            <div>
              <label htmlFor="roleFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                id="roleFilter"
                className="input"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            
            <div>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setRoleFilter('all');
                  setCurrentPage(1);
                }}
                className="btn btn-outline h-[42px]"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
        
        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <FaUser className="text-primary" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">ID: {user._id.slice(-6)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="flex items-center text-sm text-gray-900">
                            <FaEnvelope className="mr-2 text-gray-400" />
                            {user.email}
                          </div>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <FaPhone className="mr-2 text-gray-400" />
                            {user.phone || 'Not provided'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(user.createdAt)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-800'}`}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {processingId === user._id ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <div className="flex space-x-3">
                            {user.role === 'user' ? (
                              <button
                                onClick={() => handleRoleChange(user._id, 'admin')}
                                className="text-primary hover:text-primary/80"
                                title="Make Admin"
                              >
                                <FaUserShield />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleRoleChange(user._id, 'user')}
                                className="text-gray-600 hover:text-gray-900"
                                title="Make User"
                              >
                                <FaUserAlt />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete User"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{currentPage}</span> of{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`btn btn-sm ${currentPage === 1 ? 'btn-disabled' : 'btn-outline'}`}
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`btn btn-sm ${currentPage === totalPages ? 'btn-disabled' : 'btn-outline'}`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUsersPage; 