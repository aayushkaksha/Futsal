import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import BookingList from '../../components/booking/BookingList';
import { toast } from 'react-toastify';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    cancelledBookings: 0,
    completedBookings: 0
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

    fetchStats();
  }, [user, navigate]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch('/api/admin/bookings/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch statistics');
      }

      const data = await response.json();
      
      // Transform status stats into the required format
      const transformedStats = {
        totalBookings: data.totalBookings || 0,
        totalRevenue: 0, // We'll calculate this from the status stats
        pendingBookings: 0,
        confirmedBookings: 0,
        cancelledBookings: 0,
        completedBookings: 0
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
      console.error('Error fetching dashboard statistics:', error);
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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
            onClick={fetchStats}
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
          <p className="text-3xl font-bold text-indigo-500">{stats.todayBookings || 0}</p>
        </div>
      </div>

      {/* Booking Management */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6">Booking Management</h2>
        <BookingList isAdmin={true} onError={(error) => toast.error(error)} />
      </div>
    </div>
  );
};

export default DashboardPage; 