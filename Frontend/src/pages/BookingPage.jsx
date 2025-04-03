import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { bookingAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import WeeklyTimeTable from '../components/booking/WeeklyTimeTable';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const BookingPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [existingBookings, setExistingBookings] = useState([]);
  
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      toast.info('Please login to book a court');
      navigate('/login');
    }
    
    // Fetch existing bookings to show availability
    const fetchExistingBookings = async () => {
      try {
        setLoading(true);
        const response = await bookingAPI.getBookings();
        setExistingBookings(response.data.data);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        toast.error('Failed to load existing bookings');
      } finally {
        setLoading(false);
      }
    };
    
    if (isAuthenticated) {
      fetchExistingBookings();
    }
  }, [isAuthenticated, navigate]);

  const handleTimeSlotSelect = (timeSlot) => {
    setSelectedTimeSlot(timeSlot);
    if (timeSlot) {
      setSelectedDate(timeSlot.date);
    }
  };

  const handleNoteChange = (e) => {
    setNote(e.target.value);
  };

  const nextStep = () => {
    if (step === 1 && !selectedTimeSlot) {
      toast.warning('Please select a time slot');
      return;
    }
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedTimeSlot) {
      toast.warning('Please select a time slot');
      return;
    }
    
    try {
      setLoading(true);
      
      // Format the booking data
      const bookingData = {
        date: selectedTimeSlot.date.toISOString(),
        startTime: selectedTimeSlot.startTime,
        endTime: selectedTimeSlot.endTime,
        duration: 1, // 1 hour
        price: selectedTimeSlot.price,
        notes: note
      };
      
      // Create the booking
      await bookingAPI.createBooking(bookingData);
      
      toast.success('Booking created successfully!');
      navigate('/my-bookings');
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error(error.response?.data?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (loading && !existingBookings.length) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Book a Futsal Court</h1>
      
      {step === 1 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Step 1: Select a Time Slot</h2>
          <div className="card mb-6">
            <WeeklyTimeTable 
              onSelectTimeSlot={handleTimeSlotSelect}
              selectedDate={selectedDate}
              existingBookings={existingBookings}
            />
          </div>
          
          {selectedTimeSlot && (
            <div className="bg-green-100 border border-green-300 rounded-md p-4 mb-6">
              <h3 className="font-semibold text-green-800">Selected Time Slot:</h3>
              <p>
                <span className="font-medium">Date:</span> {formatDate(selectedTimeSlot.date)}
              </p>
              <p>
                <span className="font-medium">Time:</span> {selectedTimeSlot.startTime} - {selectedTimeSlot.endTime}
              </p>
              <p>
                <span className="font-medium">Price:</span> Rs. {selectedTimeSlot.price}
              </p>
            </div>
          )}
          
          <div className="flex justify-end">
            <button 
              onClick={nextStep}
              className="btn btn-primary"
              disabled={!selectedTimeSlot}
            >
              Continue to Confirmation
            </button>
          </div>
        </div>
      )}
      
      {step === 2 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Step 2: Confirm Your Booking</h2>
          <div className="card mb-6">
            <h3 className="font-semibold text-lg mb-4">Booking Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="font-medium">Date:</p>
                <p>{formatDate(selectedTimeSlot.date)}</p>
              </div>
              <div>
                <p className="font-medium">Time:</p>
                <p>{selectedTimeSlot.startTime} - {selectedTimeSlot.endTime}</p>
              </div>
              <div>
                <p className="font-medium">Duration:</p>
                <p>1 hour</p>
              </div>
              <div>
                <p className="font-medium">Price:</p>
                <p>Rs. {selectedTimeSlot.price}</p>
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="note" className="block font-medium mb-2">
                Add a note (optional):
              </label>
              <textarea
                id="note"
                value={note}
                onChange={handleNoteChange}
                className="input h-24"
                placeholder="Any special requests or information..."
              ></textarea>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
              <h4 className="font-semibold text-blue-800 mb-2">Payment Information:</h4>
              <p>Payment will be collected at the venue before your game.</p>
            </div>
          </div>
          
          <div className="flex justify-between">
            <button 
              onClick={prevStep}
              className="btn btn-outline"
            >
              Back
            </button>
            <button 
              onClick={handleSubmit}
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? <LoadingSpinner size="sm" color="white" /> : 'Confirm Booking'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;