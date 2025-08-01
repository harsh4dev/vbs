import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // For regular users
  const [admin, setAdmin] = useState(null); // For admins
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      // Check user authentication
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          if (!userData.id || !userData.email || !userData.name) {
            console.error('Invalid user data in localStorage:', userData);
            localStorage.removeItem('user');
            setUser(null);
          } else {
            setUser(userData);
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
          localStorage.removeItem('user');
          setUser(null);
        }
      }

      // Check admin authentication
      const storedAdmin = localStorage.getItem('admin');
      if (storedAdmin) {
        try {
          const adminData = JSON.parse(storedAdmin);
          if (!adminData.id || !adminData.email || !adminData.name) {
            console.error('Invalid admin data in localStorage:', adminData);
            localStorage.removeItem('admin');
            setAdmin(null);
          } else {
            setAdmin(adminData);
          }
        } catch (error) {
          console.error('Error parsing admin data:', error);
          localStorage.removeItem('admin');
          setAdmin(null);
        }
      }

      setLoading(false);
    };
    checkAuth();
  }, []);

  const loginUser = async (email, password, redirect = true) => {
    try {
      const response = await api.post('/api/login', { email, password });
      const { user } = response.data;
      if (!user || typeof user !== 'object') {
        throw new Error('No user data received from server');
      }
      if (!user.id || !user.email || !user.name) {
        throw new Error('User data missing required fields (id, email, name)');
      }
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      toast.success('Logged in successfully!');
      if (redirect) {
        navigate('/booking');
      }
      return user;
    } catch (error) {
      console.error('Error logging in user:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Login failed. Please check your credentials.';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const loginAdmin = async (email, password, redirect = true) => {
    try {
      const response = await api.post('/api/admin/login', { email, password }, {
        withCredentials: true,
      });
      const { admin } = response.data;
      if (!admin || typeof admin !== 'object') {
        throw new Error('No admin data received from server');
      }
      if (!admin.id || !admin.email || !admin.name) {
        throw new Error('Admin data missing required fields (id, email, name)');
      }
      localStorage.setItem('admin', JSON.stringify(admin));
      setAdmin(admin);
      toast.success('Admin logged in successfully!');
      if (redirect) {
        navigate('/aonecafe/admin/dashboard');
      }
      return admin;
    } catch (error) {
      console.error('Error logging in admin:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Admin login failed. Please check your credentials.';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logoutUser = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login', { replace: true });
    toast.success('Logged out successfully!');
  };

  const logoutAdmin = async () => {
    try {
      const response = await api.post('/api/admin/logout', {}, { withCredentials: true });
      if (response.status === 200) {
        localStorage.removeItem('admin');
        setAdmin(null);
        navigate('/aonecafe/admin/login', { replace: true });
        toast.success('Admin logged out successfully!');
      } else {
        throw new Error('Logout failed: Unexpected response status');
      }
    } catch (error) {
      console.error('Error during admin logout:', error);
      toast.error(error.response?.data?.error || 'Failed to log out. Please try again.');
    }
  };

  const sendOtp = async (email, phone) => {
    try {
      if (!phone) {
        throw new Error('Phone number is required');
      }
      const response = await api.post('/api/admin/book/send-otp', { email, phone });
      toast.success('OTP sent to your email and phone!', { toastId: 'otp-sent' });
      return response.data;
    } catch (error) {
      console.error('Error sending OTP:', error);
      const errorMessage = error.response?.data?.message || 'Failed to send OTP';
      toast.error(errorMessage, { toastId: 'otp-error' });
      throw new Error(errorMessage);
    }
  };

  const verifyOtp = async (otp) => {
    try {
      const response = await api.post('/api/admin/book/verify-otp', { otp });
      toast.success('OTP verified successfully!', { toastId: 'otp-verified' });
      return response.data;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      const errorMessage = error.response?.data?.message || 'Invalid OTP';
      toast.error(errorMessage, { toastId: 'otp-invalid' });
      throw new Error(errorMessage);
    }
  };

  const sendConfirmation = async (bookingId, email, phone) => {
    try {
      await api.post('/api/admin/book/send-confirmation', { bookingId, email, phone });
      toast.success('Confirmation email and SMS sent!', { toastId: 'confirmation-sent' });
    } catch (error) {
      console.error('Error sending confirmation:', error);
      toast.error(error.response?.data?.message || 'Failed to send confirmation.', {
        toastId: 'confirmation-error',
      });
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl font-semibold text-gray-700">Loading...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        admin,
        loginUser,
        loginAdmin,
        logoutUser,
        logoutAdmin,
        sendOtp,
        verifyOtp,
        sendConfirmation,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);