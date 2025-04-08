import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import BookingList from '../../components/booking/BookingList';
import { toast } from 'react-toastify';
import adminAPI from '../../services/adminAPI';
import CourtManagement from '../../components/court/CourtManagement';

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    cancelledBookings: 0,
    completedBookings: 0,
    todayBookings: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is admin
    if (!user || user.role !== 'admin') {
      toast.error('You do not have permission to access this page');
      navigate('/');
      return;
    }

    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await adminAPI.getBookingStats();
      
      // Transform status stats into the required format
      const transformedStats = {
        totalBookings: data.totalBookings || 0,
        pendingBookings: 0,
        confirmedBookings: 0,
        cancelledBookings: 0,
        completedBookings: 0,
        todayBookings: data.todayBookings || 0
      };

      // Process status stats
      if (data.statusStats) {
        data.statusStats.forEach(stat => {
          switch (stat._id) {
            case 'pending':
              transformedStats.pendingBookings = stat.count;
              break;
            case 'confirmed':
              transformedStats.confirmedBookings = stat.count;
              break;
            case 'cancelled':
              transformedStats.cancelledBookings = stat.count;
              break;
            case 'completed':
              transformedStats.completedBookings = stat.count;
              break;
            default:
              break;
          }
        });
      }

      setStats(transformedStats);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      await adminAPI.updateBookingStatus(bookingId, newStatus);
      // Refresh stats after status update
      await fetchDashboardData();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (bookingId) => {
    try {
      await adminAPI.deleteBooking(bookingId);
      // Refresh stats after deletion
      await fetchDashboardData();
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading && !stats.totalBookings) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Error Loading Dashboard</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('courts')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'courts'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Court Management
          </button>
        </nav>
      </div>

      {activeTab === 'overview' ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-gray-500 text-sm font-medium">Total Bookings</p>
              <p className="text-3xl font-bold">{stats.totalBookings}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-gray-500 text-sm font-medium">Pending Bookings</p>
              <p className="text-3xl font-bold text-yellow-500">{stats.pendingBookings}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-gray-500 text-sm font-medium">Confirmed Bookings</p>
              <p className="text-3xl font-bold text-green-500">{stats.confirmedBookings}</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-gray-500 text-sm font-medium">Completed Bookings</p>
              <p className="text-3xl font-bold text-blue-500">{stats.completedBookings}</p>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-gray-500 text-sm font-medium">Cancelled Bookings</p>
              <p className="text-3xl font-bold text-red-500">{stats.cancelledBookings}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-gray-500 text-sm font-medium">Today's Bookings</p>
              <p className="text-3xl font-bold text-indigo-500">{stats.todayBookings}</p>
            </div>
          </div>

          {/* Booking Management */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6">Booking Management</h2>
            <BookingList 
              isAdmin={true} 
              onError={(error) => toast.error(error)}
              fetchBookings={adminAPI.getAllBookings}
              onStatusUpdate={handleStatusUpdate}
              onDelete={handleDelete}
            />
          </div>
        </>
      ) : (
        <CourtManagement />
      )}
    </div>
  );
};

export default AdminDashboardPage; 