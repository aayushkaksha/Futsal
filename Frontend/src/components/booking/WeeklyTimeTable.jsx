import { useState, useEffect } from 'react';
import { timeSlotAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';

const WeeklyTimeTable = ({ onSelectTimeSlot, selectedDate, existingBookings = [] }) => {
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const { isAdmin } = useAuth();

  // Hours from 7am to 7pm
  const hours = Array.from({ length: 13 }, (_, i) => i + 7);
  
  // Days of the week
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  // Get the week dates based on selectedDate
  const getWeekDates = (date) => {
    // Make sure we have a valid date object
    const targetDate = date instanceof Date ? date : new Date();
    
    // Get the day of the week (0 = Sunday, 1 = Monday, etc.)
    const currentDay = targetDate.getDay();
    
    // Adjust to make Monday the first day (0)
    const daysSinceMonday = currentDay === 0 ? 6 : currentDay - 1;
    
    // Get Monday of the week containing the target date
    const monday = new Date(targetDate);
    monday.setDate(targetDate.getDate() - daysSinceMonday);
    
    // Generate all dates for the week
    return days.map((day, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      return {
        day,
        date,
        formattedDate: date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        })
      };
    });
  };
  
  // Update weekDates when selectedDate changes
  const [weekDates, setWeekDates] = useState([]);
  
  useEffect(() => {
    setWeekDates(getWeekDates(selectedDate));
  }, [selectedDate]);

  useEffect(() => {
    const fetchAllTimeSlots = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all time slots
        const response = await timeSlotAPI.getTimeSlots();
        
        // Handle different response formats
        const data = response.data?.data || response.data;
        
        if (!Array.isArray(data)) {
          console.error('Invalid response format:', response);
          setError('Received invalid data format from server');
          return;
        }
        
        setTimeSlots(data);
      } catch (err) {
        console.error('Error fetching time slots:', err);
        const errorMessage = err.response?.data?.message || 
                             err.message || 
                             'Failed to load time slots. Please try again.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchAllTimeSlots();
  }, []);

  // Check if a slot is available
  const isSlotAvailable = (day, hour) => {
    const hourStr = `${hour}:00`;
    const nextHourStr = `${hour + 1}:00`;
    
    // Find matching time slot
    const slot = timeSlots.find(slot => 
      slot.day === day && 
      slot.startTime === hourStr && 
      slot.endTime === nextHourStr
    );
    
    // If no slot defined, assume unavailable
    if (!slot) return false;
    
    // Check if slot is marked as available
    return slot.isAvailable;
  };
  
  // Check if a slot is booked
  const isSlotBooked = (day, hour) => {
    if (!existingBookings.length || weekDates.length === 0) return false;
    
    const slotDate = weekDates.find(d => d.day === day)?.date;
    if (!slotDate) return false;
    
    const slotDateStr = slotDate.toISOString().split('T')[0];
    const hourStr = `${hour}:00`;
    const nextHourStr = `${hour + 1}:00`;
    
    return existingBookings.some(booking => 
      new Date(booking.date).toISOString().split('T')[0] === slotDateStr &&
      booking.startTime === hourStr &&
      booking.endTime === nextHourStr
    );
  };
  
  // Get price for a slot
  const getSlotPrice = (day, hour) => {
    const hourStr = `${hour}:00`;
    const nextHourStr = `${hour + 1}:00`;
    
    const slot = timeSlots.find(slot => 
      slot.day === day && 
      slot.startTime === hourStr && 
      slot.endTime === nextHourStr
    );
    
    return slot ? slot.price : '-';
  };

  // Handle slot selection
  const handleSelectSlot = (day, hour) => {
    if (!isSlotAvailable(day, hour) && !isAdmin) return;
    
    const hourStr = `${hour}:00`;
    const nextHourStr = `${hour + 1}:00`;
    
    const slot = timeSlots.find(slot => 
      slot.day === day && 
      slot.startTime === hourStr && 
      slot.endTime === nextHourStr
    );
    
    if (slot) {
      setSelectedSlot(slot);
      
      // Get the date for the selected day
      const dateObj = weekDates.find(d => d.day === day)?.date;
      
      if (dateObj) {
        onSelectTimeSlot({
          ...slot,
          date: dateObj
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="py-8 text-center">
        <LoadingSpinner />
        <p className="mt-2 text-gray-600">Loading timetable...</p>
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

  if (weekDates.length === 0) {
    return (
      <div className="py-8 text-center text-red-500">
        <p>Error: Could not determine week dates</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr>
            <th className="border border-gray-200 p-2 bg-gray-50">Time</th>
            {weekDates.map(({ day, formattedDate }) => (
              <th key={day} className="border border-gray-200 p-2 bg-gray-50">
                <div>{day}</div>
                <div className="text-sm text-gray-500">{formattedDate}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {hours.map(hour => (
            <tr key={hour}>
              <td className="border border-gray-200 p-2 font-medium bg-gray-50">
                {hour}:00 - {hour + 1}:00
              </td>
              {days.map(day => {
                const available = isSlotAvailable(day, hour);
                const booked = isSlotBooked(day, hour);
                const price = getSlotPrice(day, hour);
                
                // Find the slot to check if it's selected
                const hourStr = `${hour}:00`;
                const nextHourStr = `${hour + 1}:00`;
                const slot = timeSlots.find(s => 
                  s.day === day && 
                  s.startTime === hourStr && 
                  s.endTime === nextHourStr
                );
                
                const isSelected = selectedSlot && slot && selectedSlot._id === slot._id;
                
                return (
                  <td 
                    key={`${day}-${hour}`} 
                    className={`
                      border border-gray-200 p-2 text-center
                      ${!available && !isAdmin ? 'bg-gray-100' : ''}
                      ${booked ? 'bg-red-100' : ''}
                      ${available && !booked ? 'bg-green-100' : ''}
                      ${isSelected ? 'bg-blue-200 border-2 border-blue-500' : ''}
                      ${(available || isAdmin) ? 'cursor-pointer hover:bg-blue-50' : 'cursor-not-allowed'}
                    `}
                    onClick={() => handleSelectSlot(day, hour)}
                  >
                    <div className="font-medium">
                      {booked ? 'Booked' : available ? 'Available' : 'Unavailable'}
                    </div>
                    <div className="text-sm">Rs. {price}</div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WeeklyTimeTable; 