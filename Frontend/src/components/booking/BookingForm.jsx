import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const BookingForm = ({ courts = [], onSuccess }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    court: '',
    date: new Date(),
    startTime: '',
    endTime: '',
    duration: 1,
    numberOfPlayers: 1,
    equipment: false,
    notes: ''
  });

  const [availableTimes, setAvailableTimes] = useState([
    '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
    '19:00', '20:00', '21:00'
  ]);

  useEffect(() => {
    if (formData.court && formData.date) {
      fetchAvailableTimes();
    }
  }, [formData.court, formData.date]);

  const fetchAvailableTimes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/courts/${formData.court}/availability?date=${formData.date.toISOString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch available times');
      }
      const data = await response.json();
      
      // If we get available times from the API, use those
      // Otherwise, use the default times
      if (data.availableTimes && data.availableTimes.length > 0) {
        setAvailableTimes(data.availableTimes);
      }
    } catch (error) {
      console.error('Error fetching available times:', error);
      toast.error('Failed to fetch available times. Using default time slots.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };
      
      // Calculate end time when start time or duration changes
      if (name === 'startTime' || name === 'duration') {
        if (newData.startTime && newData.duration) {
          const [hours, minutes] = newData.startTime.split(':').map(Number);
          const endTime = new Date();
          endTime.setHours(hours + Number(newData.duration), minutes);
          newData.endTime = `${endTime.getHours().toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }
      }
      
      return newData;
    });
  };

  const handleDateChange = (date) => {
    // Validate that the selected date is not in the past
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    if (date < now) {
      toast.error('Please select a future date');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      date
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate that the selected time is in the future
    const selectedDateTime = new Date(formData.date);
    const [hours, minutes] = formData.startTime.split(':').map(Number);
    selectedDateTime.setHours(hours, minutes);
    
    if (selectedDateTime < new Date()) {
      toast.error('Please select a future time');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create booking');
      }

      toast.success('Booking created successfully!');
      if (onSuccess) {
        onSuccess(data.data);
      }
      navigate('/my-bookings');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Court</label>
        <select
          name="court"
          value={formData.court}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="">Select a court</option>
          {courts && courts.length > 0 ? (
            courts.map(court => (
              <option key={court._id} value={court._id}>
                {court.name} - Capacity: {court.capacity} players
              </option>
            ))
          ) : (
            <option value="" disabled>No courts available</option>
          )}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Date</label>
        <DatePicker
          selected={formData.date}
          onChange={handleDateChange}
          minDate={new Date()}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Start Time</label>
          <select
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">Select start time</option>
            {availableTimes && availableTimes.length > 0 ? (
              availableTimes.map(time => (
                <option key={time} value={time}>{time}</option>
              ))
            ) : (
              <option value="" disabled>No available times</option>
            )}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Duration (hours)</label>
          <select
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            {[1, 2, 3, 4].map(hours => (
              <option key={hours} value={hours}>{hours} hour{hours > 1 ? 's' : ''}</option>
            ))}
          </select>
        </div>
      </div>

      {formData.startTime && formData.duration && (
        <div>
          <label className="block text-sm font-medium text-gray-700">End Time</label>
          <input
            type="text"
            value={formData.endTime || ''}
            readOnly
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">Number of Players</label>
        <input
          type="number"
          name="numberOfPlayers"
          value={formData.numberOfPlayers}
          onChange={handleChange}
          min="1"
          max="10"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          name="equipment"
          checked={formData.equipment}
          onChange={handleChange}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <label className="ml-2 block text-sm text-gray-900">
          Include equipment (additional charge)
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Notes</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows="3"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {loading ? 'Creating Booking...' : 'Create Booking'}
        </button>
      </div>
    </form>
  );
};

export default BookingForm; 