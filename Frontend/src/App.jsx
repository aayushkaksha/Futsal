import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ui/ProtectedRoute';

// Public Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BookingPage from './pages/BookingPage';
import NotFoundPage from './pages/NotFoundPage';
import ErrorPage from './pages/ErrorPage';

// Protected Pages
import MyBookingsPage from './pages/MyBookingsPage';
import ProfilePage from './pages/ProfilePage';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminBookingsPage from './pages/admin/AdminBookingsPage';
import AdminTimeSlotsPage from './pages/admin/AdminTimeSlotsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes with Layout */}
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="booking" element={<BookingPage />} />
            
            {/* Protected User Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="my-bookings" element={<MyBookingsPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>
            
            {/* Protected Admin Routes */}
            <Route element={<ProtectedRoute requireAdmin={true} />}>
              <Route path="admin" element={<AdminDashboardPage />} />
              <Route path="admin/bookings" element={<AdminBookingsPage />} />
              <Route path="admin/time-slots" element={<AdminTimeSlotsPage />} />
              <Route path="admin/users" element={<AdminUsersPage />} />
            </Route>
            
            {/* Error Routes */}
            <Route path="error" element={<ErrorPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
