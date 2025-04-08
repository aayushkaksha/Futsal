import { API_BASE_URL } from '../config/constants';

const courtAPI = {
  // Get all courts
  getAllCourts: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/courts`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch courts');
      }

      // Return the data in a consistent format
      return {
        success: true,
        data: Array.isArray(data) ? data : data.data || []
      };
    } catch (error) {
      console.error('API Error:', error);
      throw new Error(error.message || 'Failed to fetch courts');
    }
  },

  // Create a new court
  createCourt: async (courtData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/courts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(courtData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create court');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw new Error(error.message || 'Failed to create court');
    }
  },

  // Update a court
  updateCourt: async (courtId, courtData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/courts/${courtId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(courtData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update court');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw new Error(error.message || 'Failed to update court');
    }
  },

  // Delete a court
  deleteCourt: async (courtId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/courts/${courtId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete court');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw new Error(error.message || 'Failed to delete court');
    }
  },
};

export default courtAPI; 