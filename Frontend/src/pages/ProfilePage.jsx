import { useState } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaEdit, FaKey } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { authAPI } from '../utils/api';
import { toast } from 'react-toastify';

const ProfilePage = () => {
  const { user, loading: authLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
    
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
    
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };

  const validateProfileForm = () => {
    const errors = {};
    const { name, email, phone } = profileData;

    if (!name) {
      errors.name = 'Name is required';
    }

    if (!email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email is invalid';
    }

    if (!phone) {
      errors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
      errors.phone = 'Please enter a valid 10-digit phone number';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePasswordForm = () => {
    const errors = {};
    const { currentPassword, newPassword, confirmPassword } = passwordData;

    if (!currentPassword) {
      errors.currentPassword = 'Current password is required';
    }

    if (!newPassword) {
      errors.newPassword = 'New password is required';
    } else if (newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
    }

    if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateProfileForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      await authAPI.updateProfile(profileData);
      toast.success('Profile updated successfully');
      setIsEditing(false);
      // Refresh page to update user data
      window.location.reload();
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      await authAPI.changePassword(passwordData);
      toast.success('Password changed successfully');
      setIsChangingPassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Error changing password:', error);
      const errorMessage = error.response?.data?.message || 'Failed to change password';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center py-12">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">My Profile</h1>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="bg-primary text-white py-4 px-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Personal Information</h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-white hover:text-accent transition-colors"
                  >
                    <FaEdit size={20} />
                  </button>
                )}
              </div>
            </div>
            
            <div className="p-6">
              {isEditing ? (
                <form onSubmit={handleProfileSubmit}>
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaUser className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={profileData.name}
                        onChange={handleProfileChange}
                        className={`input pl-10 ${formErrors.name ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {formErrors.name && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaEnvelope className="text-gray-400" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleProfileChange}
                        className={`input pl-10 ${formErrors.email ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {formErrors.email && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                    )}
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaPhone className="text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleProfileChange}
                        className={`input pl-10 ${formErrors.phone ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {formErrors.phone && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>
                    )}
                  </div>
                  
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="btn btn-outline"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <LoadingSpinner size="sm" color="white" />
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start">
                    <FaUser className="mr-3 mt-1 text-primary" />
                    <div>
                      <p className="text-sm text-gray-600">Full Name</p>
                      <p className="font-medium">{user?.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <FaEnvelope className="mr-3 mt-1 text-primary" />
                    <div>
                      <p className="text-sm text-gray-600">Email Address</p>
                      <p className="font-medium">{user?.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <FaPhone className="mr-3 mt-1 text-primary" />
                    <div>
                      <p className="text-sm text-gray-600">Phone Number</p>
                      <p className="font-medium">{user?.phone}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-primary text-white py-4 px-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Security</h2>
                {!isChangingPassword && (
                  <button
                    onClick={() => setIsChangingPassword(true)}
                    className="text-white hover:text-accent transition-colors"
                  >
                    <FaEdit size={20} />
                  </button>
                )}
              </div>
            </div>
            
            <div className="p-6">
              {isChangingPassword ? (
                <form onSubmit={handlePasswordSubmit}>
                  <div className="mb-4">
                    <label htmlFor="currentPassword" className="block text-gray-700 font-medium mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaKey className="text-gray-400" />
                      </div>
                      <input
                        type="password"
                        id="currentPassword"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className={`input pl-10 ${formErrors.currentPassword ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {formErrors.currentPassword && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.currentPassword}</p>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="newPassword" className="block text-gray-700 font-medium mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaKey className="text-gray-400" />
                      </div>
                      <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className={`input pl-10 ${formErrors.newPassword ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {formErrors.newPassword && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.newPassword}</p>
                    )}
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaKey className="text-gray-400" />
                      </div>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className={`input pl-10 ${formErrors.confirmPassword ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {formErrors.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.confirmPassword}</p>
                    )}
                  </div>
                  
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setIsChangingPassword(false)}
                      className="btn btn-outline"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <LoadingSpinner size="sm" color="white" />
                      ) : (
                        'Change Password'
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FaKey className="mr-3 text-primary" />
                    <div>
                      <p className="font-medium">Password</p>
                      <p className="text-sm text-gray-600">Last changed: {user?.passwordUpdatedAt ? new Date(user.passwordUpdatedAt).toLocaleDateString() : 'Never'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsChangingPassword(true)}
                    className="btn btn-outline"
                  >
                    Change Password
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 