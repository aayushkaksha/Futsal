import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import courtAPI from '../../services/courtAPI';

const CourtManagement = () => {
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourt, setEditingCourt] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    pricePerHour: '',
    surface: '',
    isIndoor: false,
    hasLighting: false,
    capacity: '',
  });

  useEffect(() => {
    loadCourts();
  }, []);

  const loadCourts = async () => {
    try {
      setLoading(true);
      const response = await courtAPI.getAllCourts();
      // Ensure we're setting an array, even if the response is empty
      setCourts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error loading courts:', error);
      toast.error(error.message || 'Failed to load courts');
      setCourts([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      pricePerHour: '',
      surface: '',
      isIndoor: false,
      hasLighting: false,
      capacity: '',
    });
    setEditingCourt(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const courtData = {
        ...formData,
        pricePerHour: Number(formData.pricePerHour),
        capacity: Number(formData.capacity),
      };

      if (editingCourt) {
        await courtAPI.updateCourt(editingCourt._id, courtData);
        toast.success('Court updated successfully');
      } else {
        await courtAPI.createCourt(courtData);
        toast.success('Court created successfully');
      }

      setIsModalOpen(false);
      resetForm();
      loadCourts();
    } catch (error) {
      console.error('Error submitting court:', error);
      toast.error(error.message || 'Failed to save court');
    }
  };

  const handleEdit = (court) => {
    setEditingCourt(court);
    setFormData({
      name: court.name,
      description: court.description,
      pricePerHour: court.pricePerHour.toString(),
      surface: court.surface,
      isIndoor: court.isIndoor,
      hasLighting: court.hasLighting,
      capacity: court.capacity.toString(),
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (courtId) => {
    if (window.confirm('Are you sure you want to delete this court?')) {
      try {
        await courtAPI.deleteCourt(courtId);
        toast.success('Court deleted successfully');
        loadCourts();
      } catch (error) {
        console.error('Error deleting court:', error);
        toast.error(error.message || 'Failed to delete court');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Court Management</h2>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Add New Court
        </button>
      </div>

      {/* Courts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courts.length > 0 ? (
          courts.map((court) => (
            <div key={court._id} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-2">{court.name}</h3>
              <p className="text-gray-600 mb-4">{court.description}</p>
              <div className="space-y-2">
                <p><span className="font-medium">Price:</span> ₹{court.pricePerHour}/hour</p>
                <p><span className="font-medium">Surface:</span> {court.surface}</p>
                <p><span className="font-medium">Capacity:</span> {court.capacity} players</p>
                <div className="flex space-x-4">
                  {court.isIndoor && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Indoor</span>
                  )}
                  {court.hasLighting && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">Lighting</span>
                  )}
                </div>
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={() => handleEdit(court)}
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(court._id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-gray-500">
            No courts available. Click "Add New Court" to create one.
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">
              {editingCourt ? 'Edit Court' : 'Add New Court'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Price per Hour (₹)</label>
                <input
                  type="number"
                  name="pricePerHour"
                  value={formData.pricePerHour}
                  onChange={handleInputChange}
                  min="0"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Surface Type</label>
                <input
                  type="text"
                  name="surface"
                  value={formData.surface}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Court Capacity</label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  min="1"
                  max="15"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isIndoor"
                    checked={formData.isIndoor}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">Indoor Court</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="hasLighting"
                    checked={formData.hasLighting}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">Has Lighting</span>
                </label>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  {editingCourt ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourtManagement; 