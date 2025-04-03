import { useState, useEffect } from 'react';
import { FaClock, FaPlus, FaEdit, FaTrash, FaExclamationTriangle } from 'react-icons/fa';
import { timeSlotAPI } from '../../utils/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { toast } from 'react-toastify';

const AdminTimeSlotsPage = () => {
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTimeSlot, setCurrentTimeSlot] = useState(null);
  const [formData, setFormData] = useState({
    day: 'Monday',
    startTime: '08:00',
    endTime: '09:00',
    price: '',
    isAvailable: true,
    isSpecialPrice: false,
  });
  const [processingId, setProcessingId] = useState(null);

  const daysOfWeek = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  const fetchTimeSlots = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await timeSlotAPI.getAllTimeSlots();
      setTimeSlots(response.data.data);
    } catch (err) {
      console.error('Error fetching time slots:', err);
      setError('Failed to load time slots. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeSlots();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const resetForm = () => {
    setFormData({
      day: 'Monday',
      startTime: '08:00',
      endTime: '09:00',
      price: '',
      isAvailable: true,
      isSpecialPrice: false,
    });
    setIsEditing(false);
    setCurrentTimeSlot(null);
  };

  const openModal = (timeSlot = null) => {
    if (timeSlot) {
      setIsEditing(true);
      setCurrentTimeSlot(timeSlot);
      setFormData({
        day: timeSlot.day,
        startTime: timeSlot.startTime,
        endTime: timeSlot.endTime,
        price: timeSlot.price.toString(),
        isAvailable: timeSlot.isAvailable,
        isSpecialPrice: timeSlot.isSpecialPrice,
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const validateForm = () => {
    if (!formData.day) {
      toast.error('Please select a day');
      return false;
    }
    if (!formData.startTime) {
      toast.error('Please enter a start time');
      return false;
    }
    if (!formData.endTime) {
      toast.error('Please enter an end time');
      return false;
    }
    if (!formData.price || isNaN(formData.price) || Number(formData.price) <= 0) {
      toast.error('Please enter a valid price');
      return false;
    }
    if (formData.startTime >= formData.endTime) {
      toast.error('End time must be after start time');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      const timeSlotData = {
        ...formData,
        price: Number(formData.price),
      };
      
      if (isEditing) {
        await timeSlotAPI.updateTimeSlot(currentTimeSlot._id, timeSlotData);
        toast.success('Time slot updated successfully');
      } else {
        await timeSlotAPI.createTimeSlot(timeSlotData);
        toast.success('Time slot created successfully');
      }
      
      closeModal();
      fetchTimeSlots();
    } catch (err) {
      console.error('Error saving time slot:', err);
      const errorMessage = err.response?.data?.message || 'Failed to save time slot';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (timeSlotId) => {
    if (!window.confirm('Are you sure you want to delete this time slot?')) {
      return;
    }

    try {
      setProcessingId(timeSlotId);
      await timeSlotAPI.deleteTimeSlot(timeSlotId);
      toast.success('Time slot deleted successfully');
      setTimeSlots(timeSlots.filter(slot => slot._id !== timeSlotId));
    } catch (err) {
      console.error('Error deleting time slot:', err);
      const errorMessage = err.response?.data?.message || 'Failed to delete time slot';
      toast.error(errorMessage);
    } finally {
      setProcessingId(null);
    }
  };

  const groupTimeSlotsByDay = () => {
    const grouped = {};
    
    daysOfWeek.forEach(day => {
      grouped[day] = timeSlots.filter(slot => slot.day === day)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));
    });
    
    return grouped;
  };

  if (loading && timeSlots.length === 0) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center py-12">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Loading time slots...</p>
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
              <h2 className="text-2xl font-bold mb-2">Error Loading Time Slots</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button 
                onClick={fetchTimeSlots}
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

  const groupedTimeSlots = groupTimeSlotsByDay();

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Manage Time Slots</h1>
          <button
            onClick={() => openModal()}
            className="btn btn-primary flex items-center"
          >
            <FaPlus className="mr-2" />
            Add Time Slot
          </button>
        </div>
        
        {/* Time Slots by Day */}
        {daysOfWeek.map(day => (
          <div key={day} className="mb-8">
            <h2 className="text-xl font-bold mb-4">{day}</h2>
            
            {groupedTimeSlots[day].length > 0 ? (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Special Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {groupedTimeSlots[day].map((timeSlot) => (
                        <tr key={timeSlot._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <FaClock className="text-primary mr-2" />
                              <span>{timeSlot.startTime} - {timeSlot.endTime}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium">Rs. {timeSlot.price}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${timeSlot.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {timeSlot.isAvailable ? 'Available' : 'Unavailable'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${timeSlot.isSpecialPrice ? 'bg-accent/20 text-accent' : 'bg-gray-100 text-gray-800'}`}>
                              {timeSlot.isSpecialPrice ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {processingId === timeSlot._id ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              <div className="flex space-x-3">
                                <button
                                  onClick={() => openModal(timeSlot)}
                                  className="text-primary hover:text-primary/80"
                                  title="Edit"
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  onClick={() => handleDelete(timeSlot._id)}
                                  className="text-red-600 hover:text-red-900"
                                  title="Delete"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <p className="text-gray-500">No time slots for {day}</p>
              </div>
            )}
          </div>
        ))}
        
        {/* Time Slot Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
              <div className="bg-primary text-white py-4 px-6">
                <h2 className="text-xl font-bold">
                  {isEditing ? 'Edit Time Slot' : 'Add Time Slot'}
                </h2>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6">
                <div className="mb-4">
                  <label htmlFor="day" className="block text-gray-700 font-medium mb-2">
                    Day
                  </label>
                  <select
                    id="day"
                    name="day"
                    value={formData.day}
                    onChange={handleInputChange}
                    className="input"
                    required
                  >
                    {daysOfWeek.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="startTime" className="block text-gray-700 font-medium mb-2">
                      Start Time
                    </label>
                    <input
                      type="time"
                      id="startTime"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      className="input"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="endTime" className="block text-gray-700 font-medium mb-2">
                      End Time
                    </label>
                    <input
                      type="time"
                      id="endTime"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      className="input"
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="price" className="block text-gray-700 font-medium mb-2">
                    Price (Rs.)
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="input"
                    min="0"
                    step="50"
                    required
                  />
                </div>
                
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="isAvailable"
                    name="isAvailable"
                    checked={formData.isAvailable}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor="isAvailable" className="ml-2 block text-gray-700">
                    Available for booking
                  </label>
                </div>
                
                <div className="flex items-center mb-6">
                  <input
                    type="checkbox"
                    id="isSpecialPrice"
                    name="isSpecialPrice"
                    checked={formData.isSpecialPrice}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor="isSpecialPrice" className="ml-2 block text-gray-700">
                    Special price (e.g., weekend or peak hour rate)
                  </label>
                </div>
                
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="btn btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <LoadingSpinner size="sm" color="white" />
                    ) : (
                      isEditing ? 'Update' : 'Create'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTimeSlotsPage; 