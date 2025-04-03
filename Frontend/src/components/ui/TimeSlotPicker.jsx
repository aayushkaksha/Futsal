import { useState, useEffect } from 'react';
import { timeSlotAPI } from '../../utils/api';
import LoadingSpinner from './LoadingSpinner';

const TimeSlotPicker = ({ date, onSelectTimeSlot }) => {
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    if (!date) return;

    const fetchTimeSlots = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get day of week from date
        const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
        
        // Fetch time slots for this day
        const response = await timeSlotAPI.getTimeSlotsByDay(dayOfWeek);
        setTimeSlots(response.data.data);
      } catch (err) {
        console.error('Error fetching time slots:', err);
        setError('Failed to load time slots. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTimeSlots();
  }, [date]);

  const handleSelectTimeSlot = (timeSlot) => {
    setSelectedSlot(timeSlot);
    onSelectTimeSlot(timeSlot);
  };

  if (loading) {
    return (
      <div className="py-8 text-center">
        <LoadingSpinner />
        <p className="mt-2 text-gray-600">Loading available time slots...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  if (timeSlots.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-600">No time slots available for this day.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 py-4">
      {timeSlots.map((slot) => (
        <div
          key={slot._id}
          className={`
            border rounded-lg p-4 cursor-pointer transition-colors
            ${!slot.isAvailable ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''}
            ${selectedSlot?._id === slot._id ? 'border-primary bg-primary/10' : 'border-gray-200 hover:border-primary'}
          `}
          onClick={() => slot.isAvailable && handleSelectTimeSlot(slot)}
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">{slot.startTime} - {slot.endTime}</p>
              <p className="text-sm text-gray-600">
                {slot.isSpecialPrice ? 'Special Price' : 'Regular Price'}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg">Rs. {slot.price}</p>
              <p className={`text-sm ${slot.isAvailable ? 'text-green-600' : 'text-red-500'}`}>
                {slot.isAvailable ? 'Available' : 'Booked'}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TimeSlotPicker; 