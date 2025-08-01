import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import PublicRoute from './components/common/PublicRoute';

// Public Pages
import HomePage from './pages/public/HomePage';
import BookingPage from './pages/public/BookingPage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import PublicLayout from './layouts/PublicLayout';

// Admin Pages
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import BookingsManagement from './pages/admin/BookingsManagement';
import VenuesManagement from './pages/admin/VenuesManagement';
import ShiftsManagement from './pages/admin/ShiftsManagement';
import PackagesManagement from './pages/admin/PackagesManagement';
import MenusManagement from './pages/admin/MenusManagement';
import UsersManagement from './pages/admin/UsersManagement';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            } 
          />
        </Route>

        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute adminOnly>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="bookings" element={<BookingsManagement />} />
          <Route path="venues" element={<VenuesManagement />} />
          <Route path="shifts" element={<ShiftsManagement />} />
          <Route path="packages" element={<PackagesManagement />} />
          <Route path="menus" element={<MenusManagement />} />
          <Route path="users" element={<UsersManagement />} />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;