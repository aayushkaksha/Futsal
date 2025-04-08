import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import BookingForm from '../components/booking/BookingForm';

const BookingPage = () => {
  const { isAuthenticated, token } = useAuth();
  const navigate = useNavigate();
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      toast.info('Please login to book a court');
      navigate('/login');
      return;
    }
    
    // Fetch courts
    const fetchCourts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/courts', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch courts');
        }
        
        const data = await response.json();
        setCourts(data.data);
      } catch (error) {
        console.error('Error fetching courts:', error);
        toast.error('Failed to load available courts');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourts();
  }, [isAuthenticated, navigate]);

  const handleBookingSuccess = (booking) => {
    toast.success('Booking created successfully!');
    navigate('/my-bookings');
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center items-center h-64">
          <div className="loader">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Book a Futsal Court</h1>
      
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        {courts.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-lg text-gray-700">No courts are available right now.</p>
            <p className="text-gray-500">Please check back later or contact the administrator.</p>
          </div>
        ) : (
          <BookingForm courts={courts} onSuccess={handleBookingSuccess} />
        )}
      </div>
    </div>
  );
};

export default BookingPage;