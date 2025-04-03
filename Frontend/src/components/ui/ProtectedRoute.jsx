import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If admin route but user is not admin, redirect to home
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Render the protected content
  return <Outlet />;
};

export default ProtectedRoute; 