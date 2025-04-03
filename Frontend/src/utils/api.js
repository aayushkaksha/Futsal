import axios from 'axios';

// Ensure the base URL is correct
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth API - Make sure all paths include /api prefix
export const authAPI = {
  register: (userData) => api.post('/api/auth/register', userData),
  login: (credentials) => api.post('/api/auth/login', credentials),
  getProfile: () => api.get('/api/auth/me'),
  updateProfile: (userData) => api.put('/api/auth/me', userData),
  changePassword: (passwordData) => api.put('/api/auth/change-password', passwordData)
};

// Booking API
export const bookingAPI = {
  createBooking: (bookingData) => api.post('/', bookingData),
  getBookings: (filters = {}) => api.get('/', { params: filters }),
  getUserBookings: async () => {
    return api.get('/user');
  },
  getBooking: (id) => api.get(`/${id}`),
  updateBooking: (id, bookingData) => api.put(`/${id}`, bookingData),
  deleteBooking: (id) => api.delete(`/${id}`)
};

// Time Slot API
export const timeSlotAPI = {
  getTimeSlots: async () => {
    return axios.get('/api/timeslots');
  },
  getTimeSlotsByDay: (day) => api.get(`/api/timeslots/day/${day}`),
  getTimeSlot: (id) => api.get(`/api/timeslots/${id}`),
  createTimeSlot: (timeSlotData) => api.post('/api/timeslots', timeSlotData),
  updateTimeSlot: (id, timeSlotData) => api.put(`/api/timeslots/${id}`, timeSlotData),
  deleteTimeSlot: (id) => api.delete(`/api/timeslots/${id}`)
};

// User API
export const userAPI = {
  getUsers: () => api.get('/api/users'),
  getUser: (id) => api.get(`/api/users/${id}`),
  updateUser: (id, userData) => api.put(`/api/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/api/users/${id}`),
  changeUserRole: (id, role) => api.put(`/api/users/${id}/role`, { role })
};

export default api; 
