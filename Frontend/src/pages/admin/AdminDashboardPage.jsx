import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaUsers, FaClock, FaChartBar, FaExclamationTriangle } from 'react-icons/fa';
import { bookingAPI, userAPI, timeSlotAPI } from '../../utils/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    totalUsers: 0,
    totalTimeSlots: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch bookings with limit=5 for recent bookings
        const bookingsResponse = await bookingAPI.getAllBookings({ limit: 5, sort: '-createdAt' });
        setRecentBookings(bookingsResponse.data.data);

        // Fetch stats
        const [allBookingsResponse, usersResponse, timeSlotsResponse] = await Promise.all([
          bookingAPI.getAllBookings(),
          userAPI.getAllUsers(),
          timeSlotAPI.getAllTimeSlots(),
        ]);

        const allBookings = allBookingsResponse.data.data;
        const pendingBookings = allBookings.filter(booking => booking.status === 'pending');

        setStats({
          totalBookings: allBookings.length,
          pendingBookings: pendingBookings.length,
          totalUsers: usersResponse.data.data.length,
          totalTimeSlots: timeSlotsResponse.data.data.length,
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center py-12">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Loading dashboard data...</p>
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
              <h2 className="text-2xl font-bold mb-2">Error Loading Dashboard</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button 
                onClick={() => window.location.reload()}
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
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-primary/10 text-primary mr-4">
                <FaCalendarAlt size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold">{stats.totalBookings}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-800 mr-4">
                <FaCalendarAlt size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending Bookings</p>
                <p className="text-2xl font-bold">{stats.pendingBookings}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-secondary/10 text-secondary mr-4">
                <FaUsers size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-accent/10 text-accent mr-4">
                <FaClock size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Time Slots</p>
                <p className="text-2xl font-bold">{stats.totalTimeSlots}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link 
            to="/admin/bookings" 
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-primary/10 text-primary mr-4">
                <FaCalendarAlt size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold">Manage Bookings</h3>
                <p className="text-gray-600">View and manage all bookings</p>
              </div>
            </div>
          </Link>
          
          <Link 
            to="/admin/time-slots" 
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-accent/10 text-accent mr-4">
                <FaClock size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold">Manage Time Slots</h3>
                <p className="text-gray-600">Create and edit time slots</p>
              </div>
            </div>
          </Link>
          
          <Link 
            to="/admin/users" 
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-secondary/10 text-secondary mr-4">
                <FaUsers size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold">Manage Users</h3>
                <p className="text-gray-600">View and manage user accounts</p>
              </div>
            </div>
          </Link>
        </div>
        
        {/* Recent Bookings */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-primary text-white py-4 px-6 flex justify-between items-center">
            <h2 className="text-xl font-bold">Recent Bookings</h2>
            <Link to="/admin/bookings" className="text-sm text-white hover:text-accent">
              View All
            </Link>
          </div>
          
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentBookings.length > 0 ? (
                  recentBookings.map((booking) => (
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
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      No recent bookings found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage; 