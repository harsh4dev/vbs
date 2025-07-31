import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User2, Mail, Lock, CheckCircle, XCircle, Settings as SettingsIcon } from 'lucide-react';
import { updateAdmin } from '../../services/userService';
import { useAuth } from '../../contexts/AuthContext'; // Import useAuth
import { toast } from 'react-toastify'; // For notifications

const Settings = () => {
  const { admin, logoutAdmin } = useAuth(); // Get admin and logoutAdmin from AuthContext
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [originalData, setOriginalData] = useState({
    name: '',
    email: '',
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [serverError, setServerError] = useState('');
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load admin data from AuthContext and localStorage
  useEffect(() => {
    try {
      // Prioritize AuthContext admin data
      if (admin) {
        setUserId(admin.id);
        setFormData({
          name: admin.name || '',
          email: admin.email || '',
          password: '',
          confirmPassword: '',
        });
        setOriginalData({
          name: admin.name || '',
          email: admin.email || '',
        });
      } else {
        // Fallback to localStorage
        const storedAdmin = localStorage.getItem('admin');
        if (storedAdmin) {
          const parsedAdmin = JSON.parse(storedAdmin);
          if (!parsedAdmin.id) {
            throw new Error('Admin ID missing in localStorage');
          }
          setUserId(parsedAdmin.id);
          setFormData({
            name: parsedAdmin.name || '',
            email: parsedAdmin.email || '',
            password: '',
            confirmPassword: '',
          });
          setOriginalData({
            name: parsedAdmin.name || '',
            email: parsedAdmin.email || '',
          });
        } else {
          throw new Error('No admin data found in localStorage');
        }
      }
      console.log('Settings: Loaded admin data', { userId, admin });
    } catch (error) {
      console.error('Error loading admin from localStorage:', error);
      setServerError('Failed to load admin data');
    }
  }, [admin]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setSuccess('');
    setServerError('');
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim() || formData.name.length < 2) {
      newErrors.name = 'Name is required and must be at least 2 characters';
    }
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'A valid email is required';
    }
    if (formData.password) {
      if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      setServerError('Admin ID is missing. Please log in again.');
      return;
    }
    if (!validateForm()) return;

    setLoading(true);
    setSuccess('');
    setServerError('');

    try {
      // Build updateData with original values for unchanged fields
      const updateData = {
        name: formData.name !== originalData.name ? formData.name : originalData.name,
        email: formData.email !== originalData.email ? formData.email : originalData.email,
      };
      if (formData.password) {
        updateData.password = formData.password;
      }

      console.log('Settings: Updating admin', { userId, updateData });
      await updateAdmin(userId, updateData);

      // Update localStorage
      const updatedAdmin = {
        id: userId,
        name: updateData.name,
        email: updateData.email,
      };
      localStorage.setItem('admin', JSON.stringify(updatedAdmin));
      // Update originalData to reflect new values
      setOriginalData({
        name: updateData.name,
        email: updateData.email,
      });

      setSuccess('Profile updated successfully! Logging out...');
      setFormData((prev) => ({ ...prev, password: '', confirmPassword: '' }));

      // Trigger logout after 2 seconds to allow user to see success message
      setTimeout(async () => {
        try {
          await logoutAdmin();
        } catch (error) {
          console.error('Logout after update failed:', error);
          toast.error('Failed to log out. Please log out manually.');
        }
      }, 2000);
    } catch (error) {
      console.error('Settings: Update error:', error);
      setServerError(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-6">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-2xl p-8 border border-gray-200"
        >
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center mb-6">
            <SettingsIcon className="h-8 w-8 text-primary-600 mr-3" />
            Admin Settings
          </h1>

          {/* Default Avatar Preview */}
          <div className="flex justify-center mb-8">
            <div className="flex-shrink-0 w-32 h-32 sm:w-24 sm:h-24 rounded-full bg-gray-100 flex items-center justify-center">
              <img
                src="/avatar.png"
                alt="Default avatar"
                className="w-full h-full rounded-full object-cover"
              />
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-green-50 p-4 rounded-xl flex items-center"
            >
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <p className="text-sm text-green-700">{success}</p>
            </motion.div>
          )}

          {/* Error Message */}
          {serverError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-red-50 p-4 rounded-xl flex items-center"
            >
              <XCircle className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-sm text-red-700">{serverError}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                <User2 className="h-4 w-4 mr-1 text-primary-600" />
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-2 border ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                placeholder="Enter your name"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                <Mail className="h-4 w-4 mr-1 text-primary-600" />
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2 border ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email}</p>
              )}
            </div>

          

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`w-full py-3 px-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-shadow ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  Updating...
                </div>
              ) : (
                'Update Profile'
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;