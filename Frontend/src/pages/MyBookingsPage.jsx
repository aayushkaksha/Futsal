import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaMoneyBillWave, FaTrash } from 'react-icons/fa';
import { bookingAPI } from '../utils/api';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { toast } from 'react-toastify';

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await bookingAPI.getUserBookings();
      setBookings(data.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError(error.response?.data?.message || 'Failed to load your bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      setCancellingId(bookingId);
      await bookingAPI.cancelBooking(bookingId);
      toast.success('Booking cancelled successfully');
      // Remove the cancelled booking from the list
      setBookings(bookings.filter(booking => booking._id !== bookingId));
    } catch (err) {
      console.error('Error cancelling booking:', err);
      const errorMessage = err.response?.data?.message || 'Failed to cancel booking';
      toast.error(errorMessage);
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
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
            <p className="mt-4 text-gray-600">Loading your bookings...</p>
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
                <FaCalendarAlt size={48} className="mx-auto" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Error Loading Bookings</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button 
                onClick={fetchBookings}
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

  if (bookings.length === 0) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-center mb-8">My Bookings</h1>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <FaCalendarAlt size={48} className="mx-auto" />
              </div>
              <h2 className="text-2xl font-bold mb-2">No Bookings Found</h2>
              <p className="text-gray-600 mb-6">You haven't made any bookings yet.</p>
              <Link to="/booking" className="btn btn-primary">
                Book Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Bookings</h1>
          <Link to="/booking" className="btn btn-primary">
            Book New Slot
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {bookings.map((booking) => (
            <div key={booking._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
                  <div>
                    <h2 className="text-xl font-bold mb-2">Booking #{booking._id.slice(-6)}</h2>
                    <div className="flex items-center text-gray-600 mb-2">
                      <FaCalendarAlt className="mr-2" />
                      <span>{formatDate(booking.date)}</span>
                    </div>
                  </div>
                  <div className="mt-2 md:mt-0">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(booking.status)}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-start">
                    <FaClock className="mr-2 mt-1 text-primary" />
                    <div>
                      <p className="text-sm text-gray-600">Time</p>
                      <p className="font-medium">{booking.timeSlot.startTime} - {booking.timeSlot.endTime}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FaMapMarkerAlt className="mr-2 mt-1 text-primary" />
                    <div>
                      <p className="text-sm text-gray-600">Court</p>
                      <p className="font-medium">Main Futsal Court</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FaMoneyBillWave className="mr-2 mt-1 text-primary" />
                    <div>
                      <p className="text-sm text-gray-600">Price</p>
                      <p className="font-medium">Rs. {booking.timeSlot.price}</p>
                    </div>
                  </div>
                </div>

                {booking.notes && (
                  <div className="bg-gray-50 p-3 rounded-md mb-4">
                    <p className="text-sm text-gray-600 mb-1">Notes:</p>
                    <p>{booking.notes}</p>
                  </div>
                )}

                {booking.status === 'confirmed' && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleCancelBooking(booking._id)}
                      disabled={cancellingId === booking._id}
                      className="btn btn-outline text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
                    >
                      {cancellingId === booking._id ? (
                        <LoadingSpinner size="sm" color="red" />
                      ) : (
                        <>
                          <FaTrash className="mr-2" />
                          Cancel Booking
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyBookingsPage; 