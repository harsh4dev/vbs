import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { FaCoffee, FaSignOutAlt } from 'react-icons/fa';
import api from '../../services/api';

function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const user = useMemo(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (err) {
      console.error('Error parsing user from localStorage:', err);
      return null;
    }
  }, []);

  useEffect(() => {
    if (!user?.id) {
      navigate('/login', { state: { from: '/profile' } });
      return;
    }

    setProfile(user);
    setFormData({ name: user.name || '', email: user.email || '', phone: user.phone || '' });
    setLoading(false);
  }, [user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccessMessage('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setFormError('Name, email, and phone are required.');
      toast.error('Name, email, and phone are required.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setFormError('Please enter a valid email address.');
      toast.error('Please enter a valid email address.');
      return;
    }
    if (!/^\d{10}$/.test(formData.phone)) {
      setFormError('Phone number must be exactly 10 digits.');
      toast.error('Phone number must be exactly 10 digits.');
      return;
    }

    try {
      const response = await api.put(`/api/user/update/${user.id}`, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      });
      const updatedUser = {
        ...user,
        name: response.data.user.name,
        email: response.data.user.email,
        phone: response.data.user.phone,
        role: response.data.user.role || user.role,
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'user',
          newValue: JSON.stringify(updatedUser),
        })
      );
      setProfile(updatedUser);
      setIsEditing(false);
      setSuccessMessage(response.data.message || 'Profile updated successfully');
      toast.success('Profile updated successfully');
    } catch (err) {
      console.error('Update user error:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('user');
        navigate('/login', { state: { from: '/profile' } });
      }
      setFormError(err.response?.data?.message || 'Failed to update profile. Please try again.');
      toast.error(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    toast.info('Logged out successfully');
    navigate('/login');
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
    setFormError('');
    setSuccessMessage('');
  };

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg shadow-lg z-20 h-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2 group">
            <FaCoffee className="text-teal-600 text-lg group-hover:text-teal-500 transition-colors duration-200" />
            <h1 className="text-lg font-extrabold text-teal-600 group-hover:text-teal-500 transition-colors duration-200">
              EventEase
            </h1>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-1 text-gray-700 hover:text-red-600 font-medium text-sm transition-colors duration-200"
          >
            <FaSignOutAlt className="text-sm" />
            <span>Log Out</span>
          </button>
        </div>
      </header>

      <main className="flex-1 h-[calc(100vh-7rem)] flex items-center justify-center px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(94,234,212,0.05)_0%,_transparent_50%)] z-0" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="max-w-md w-full bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-teal-100/50 relative overflow-hidden"
        >
          <div className="absolute inset-0 border-2 border-transparent rounded-2xl bg-gradient-to-r from-teal-400 to-cyan-500 opacity-10" />

          {loading ? (
            <div className="flex justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-500"
              />
            </div>
          ) : error ? (
            <p className="text-red-600 text-center font-medium text-sm">{error}</p>
          ) : (
            <div className="space-y-4 relative z-10">
              <motion.div
                className="flex justify-center"
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <div className="relative">
                  <img
                    src="/avatar.png"
                    alt="User Avatar"
                    className="w-20 h-20 rounded-full object-cover border-2 border-gradient-to-r from-teal-400 to-cyan-500 shadow-md"
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-teal-400 to-cyan-500 opacity-20"
                    animate={{ scale: [1, 1.03, 1], opacity: [0.2, 0.4, 0.2] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </div>
              </motion.div>

              <motion.h2
                className="text-2xl font-extrabold text-gray-900 text-center mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {isEditing ? 'Edit Profile' : 'Your Profile'}
              </motion.h2>

              <AnimatePresence>
                {successMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-teal-50 border-l-2 border-teal-500 text-teal-700 p-3 rounded-lg text-sm shadow-sm"
                  >
                    {successMessage}
                  </motion.div>
                )}
              </AnimatePresence>

              {!isEditing ? (
                <motion.div
                  className="space-y-3 text-gray-800"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center justify-between bg-gray-50/50 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                    <div>
                      <p className="text-xs font-medium text-teal-600">Name</p>
                      <p className="text-sm font-semibold">{profile?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-gray-50/50 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                    <div>
                      <p className="text-xs font-medium text-teal-600">Email</p>
                      <p className="text-sm font-semibold">{profile?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-gray-50/50 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                    <div>
                      <p className="text-xs font-medium text-teal-600">Phone</p>
                      <p className="text-sm font-semibold">+977 {profile?.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-gray-50/50 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                    <div>
                      <p className="text-xs font-medium text-teal-600">Role</p>
                      <p className="text-sm font-semibold capitalize">{profile?.role || 'User'}</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: '0 6px 20px rgba(20, 184, 166, 0.2)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleEdit}
                    className="w-full py-2 px-4 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-300 transition-all shadow-sm text-sm"
                  >
                    Edit Profile
                  </motion.button>
                </motion.div>
              ) : (
                <motion.form
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  <AnimatePresence>
                    {formError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-red-50 border-l-2 border-red-500 text-red-600 p-3 rounded-lg text-sm shadow-sm"
                      >
                        {formError}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-xs font-medium text-gray-700"
                    >
                      Name
                    </label>
                    <motion.input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-teal-400 focus:border-teal-400 text-sm transition-all shadow-sm"
                      placeholder="Enter your name"
                      whileFocus={{ scale: 1.02 }}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-xs font-medium text-gray-700"
                    >
                      Email
                    </label>
                    <motion.input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-teal-400 focus:border-teal-400 text-sm transition-all shadow-sm"
                      placeholder="Enter your email"
                      whileFocus={{ scale: 1.02 }}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-xs font-medium text-gray-700"
                    >
                      Phone
                    </label>
                    <div className="mt-1 flex rounded-lg shadow-sm">
                      <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-200 bg-gray-50 text-gray-500 text-sm">
                        <img
                          src="https://flagcdn.com/16x12/np.png"
                          alt="Nepal Flag"
                          className="mr-2"
                        />
                        +977
                      </span>
                      <motion.input
                        id="phone"
                        name="phone"
                        type="text"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="flex-1 block w-full px-3 py-2 border border-gray-200 rounded-r-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-teal-400 focus:border-teal-400 text-sm transition-all shadow-sm"
                        placeholder="Enter 10-digit phone number"
                        whileFocus={{ scale: 1.02 }}
                      />
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: '0 6px 20px rgba(20, 184, 166, 0.2)' }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      className="flex-1 py-2 px-4 Bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-300 transition-all shadow-sm text-sm"
                    >
                      Save Changes
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: '0 6px 20px rgba(107, 114, 128, 0.15)' }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={toggleEdit}
                      className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all shadow-sm text-sm"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </motion.form>
              )}
            </div>
          )}
        </motion.div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white h-12 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-center items-center">
          <p className="text-sm">
            © 2025 <Link to="/" className="text-teal-400 hover:text-teal-300 transition-colors duration-200">EventEase</Link> All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default ProfilePage;