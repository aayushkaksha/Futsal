import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';
import { toast } from 'react-toastify';

// Create auth context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user from localStorage on initial render
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Fetch user profile when token changes
  useEffect(() => {
    if (token) {
      fetchUserProfile();
    }
  }, [token]);

  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getProfile();
      const userData = response.data.user;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (err) {
      console.error('Error fetching user profile:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Register user
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.register(userData);
      const { token: newToken, user: newUser } = response.data;
      
      // Save token and user to localStorage
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      // Update state
      setToken(newToken);
      setUser(newUser);
      
      toast.success('Registration successful!');
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.login(credentials);
      const { token: newToken, user: newUser } = response.data;
      
      // Save token and user to localStorage
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      // Update state
      setToken(newToken);
      setUser(newUser);
      
      toast.success('Login successful!');
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    // Remove token and user from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Update state
    setToken(null);
    setUser(null);
    
    toast.info('Logged out successfully');
  };

  // Check if user is authenticated
  const isAuthenticated = !!token && !!user;

  // Check if user is admin
  const isAdmin = isAuthenticated && user?.role === 'admin';

  // Context value
  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    isAuthenticated,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 