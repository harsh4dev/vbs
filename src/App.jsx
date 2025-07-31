import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import PublicRoute from './components/common/PublicRoute';
import AdminPublicRoute from './components/common/AdminPublicRoute'; // Import new component

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedLayout from './layouts/ProtectedLayout';

// Public Pages
import HomePage from './pages/public/HomePage';
import BookingPage from './pages/public/BookingPage';
import UserBookingPage from './pages/public/UserBookingPage';
import AboutPage from './pages/public/AboutPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import ProfilePage from './pages/public/ProfilePage';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import BookingsManagement from './pages/admin/BookingsManagement';
import VenuesManagement from './pages/admin/VenuesManagement';
import ShiftsManagement from './pages/admin/ShiftsManagement';
import PackagesManagement from './pages/admin/PackagesManagement';
import MenusManagement from './pages/admin/MenusManagement';
import UsersManagement from './pages/admin/UsersManagement';
import AdminProfilePage from './pages/admin/AdminProfilePage';
import AdminSettings from './pages/admin/Settings';
import ForgotPasswordPage from './pages/public/ForgotPasswordPage';
import AdminForgotPassword from './pages/admin/AdminForgotPassword';
import EventManagement from './pages/admin/EventManagement';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error: error.message || 'An error occurred' };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
            <p className="text-gray-700">{this.state.error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <Routes>
          {/* Public Routes (User) */}
          <Route element={<PublicLayout />}>
            <Route index element={<HomePage />} />
            <Route path="booking" element={<BookingPage />} />
            <Route path="/user/booking" element={<UserBookingPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route
              path="login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path="forgot-password"
              element={
                <PublicRoute>
                  <ForgotPasswordPage />
                </PublicRoute>
              }
            />
            <Route
              path="register"
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              }
            />
          </Route>

          {/* Protected User Routes */}
          <Route element={<ProtectedLayout />}>
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Admin Public Routes */}
          <Route
            path="/aonecafe/admin/login"
            element={
              <AdminPublicRoute>
                <AdminLogin />
              </AdminPublicRoute>
            }
          />
          <Route
            path="/aonecafe/admin/forgot-password"
            element={
              <AdminPublicRoute>
                <AdminForgotPassword />
              </AdminPublicRoute>
            }
          />

          {/* Admin Routes (Protected) */}
          <Route
            path="/aonecafe/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="/aonecafe/admin/dashboard" element={<Dashboard />} />
             <Route path="/aonecafe/admin/events" element={<EventManagement />} />
            <Route path="/aonecafe/admin/bookings" element={<BookingsManagement />} />
            <Route path="/aonecafe/admin/venues" element={<VenuesManagement />} />
            <Route path="/aonecafe/admin/shifts" element={<ShiftsManagement />} />
            <Route path="/aonecafe/admin/packages" element={<PackagesManagement />} />
            <Route path="/aonecafe/admin/menus" element={<MenusManagement />} />
            <Route path="/aonecafe/admin/users" element={<UsersManagement />} />
            <Route path="/aonecafe/admin/profile" element={<AdminProfilePage />} />
            <Route path="/aonecafe/admin/settings" element={<AdminSettings />} />
          </Route>

          {/* Catch-all Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ErrorBoundary>
    </AuthProvider>
  );
}

export default App;