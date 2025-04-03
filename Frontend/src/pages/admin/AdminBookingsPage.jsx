import { useState, useEffect } from 'react';
import { FaCalendarAlt, FaSearch, FaFilter, FaCheck, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import { bookingAPI } from '../../utils/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { toast } from 'react-toastify';

const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [processingId, setProcessingId] = useState(null);

  const fetchBookings = async (page = 1, filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page,
        limit: 10,
        ...filters
      };
      
      const response = await bookingAPI.getAllBookings(params);
      setBookings(response.data.data);
      setTotalPages(Math.ceil(response.data.total / response.data.limit));
      setCurrentPage(response.data.page);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filters = {};
    
    if (searchTerm) {
      filters.search = searchTerm;
    }
    
    if (statusFilter !== 'all') {
      filters.status = statusFilter;
    }
    
    if (dateFilter) {
      filters.date = dateFilter;
    }
    
    fetchBookings(currentPage, filters);
  }, [currentPage, searchTerm, statusFilter, dateFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    if (!window.confirm(`Are you sure you want to mark this booking as ${newStatus}?`)) {
      return;
    }

    try {
      setProcessingId(bookingId);
      await bookingAPI.updateBookingStatus(bookingId, newStatus);
      
      // Update the booking in the state
      setBookings(bookings.map(booking => 
        booking._id === bookingId 
          ? { ...booking, status: newStatus } 
          : booking
      ));
      
      toast.success(`Booking status updated to ${newStatus}`);
    } catch (err) {
      console.error('Error updating booking status:', err);
      const errorMessage = err.response?.data?.message || 'Failed to update booking status';
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

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && bookings.length === 0) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center py-12">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Loading bookings...</p>
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
              <h2 className="text-2xl font-bold mb-2">Error Loading Bookings</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button 
                onClick={() => fetchBookings(currentPage)}
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
        <h1 className="text-3xl font-bold mb-8">Manage Bookings</h1>
        
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
                    placeholder="Search by booking ID or user name"
                    className="input pr-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <FaSearch className="text-gray-400" />
                  </button>
                </div>
              </form>
            </div>
            
            <div>
              <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <div className="relative">
                <select
                  id="statusFilter"
                  className="input pr-10 appearance-none"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <FaFilter className="text-gray-400" />
                </div>
              </div>
            </div>
            
            <div>
              <label htmlFor="dateFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                id="dateFilter"
                className="input"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
            
            <div>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setDateFilter('');
                  setCurrentPage(1);
                }}
                className="btn btn-outline h-[42px]"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
        
        {/* Bookings Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.length > 0 ? (
                  bookings.map((booking) => (
                    <tr key={booking._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          #{booking._id.slice(-6)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{booking.user.name}</div>
                        <div className="text-sm text-gray-500">{booking.user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(booking.date)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {booking.timeSlot.startTime} - {booking.timeSlot.endTime}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(booking.status)}`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {processingId === booking._id ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <div className="flex space-x-2">
                            {booking.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleStatusChange(booking._id, 'confirmed')}
                                  className="text-green-600 hover:text-green-900"
                                  title="Confirm"
                                >
                                  <FaCheck />
                                </button>
                                <button
                                  onClick={() => handleStatusChange(booking._id, 'cancelled')}
                                  className="text-red-600 hover:text-red-900"
                                  title="Cancel"
                                >
                                  <FaTimes />
                                </button>
                              </>
                            )}
                            {booking.status === 'confirmed' && (
                              <>
                                <button
                                  onClick={() => handleStatusChange(booking._id, 'completed')}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="Mark as Completed"
                                >
                                  <FaCheck />
                                </button>
                                <button
                                  onClick={() => handleStatusChange(booking._id, 'cancelled')}
                                  className="text-red-600 hover:text-red-900"
                                  title="Cancel"
                                >
                                  <FaTimes />
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      No bookings found
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

export default AdminBookingsPage; 