
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User2, Mail, Shield } from 'lucide-react';

const AdminProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');

  // Load user data from localStorage
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('admin'));
    if (user?.id) {
      setProfile({
        name: user.name || 'Unknown',
        email: user.email || 'N/A',
        role: user.role || 'admin',
      });
    } else {
      setError('No user data found in local storage.');
    }
  }, []);

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-b from-white to-slate-50 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20, duration: 0.6 }}
        className="max-w-md w-full bg-slate-100/90 backdrop-blur-sm rounded-xl shadow-xl border border-teal-200/50 p-8 hover:shadow-2xl transition-shadow"
      >
        <h2 className="text-2xl font-extrabold text-gray-800 text-center mb-6 tracking-tight">
          Admin Profile
        </h2>

        {error ? (
          <div className="bg-teal-50 border-l-4 border-teal-500 text-teal-700 p-3 rounded-md text-center text-sm font-medium">
            {error}
          </div>
        ) : !profile ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-600"></div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Avatar */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex justify-center"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-28 h-28 rounded-full bg-gray-200 flex items-center justify-center ring-3 ring-teal-400/60 ring-offset-2 ring-offset-slate-100"
              >
                <img
                  src="/avatar.png"
                  alt="Admin avatar"
                  className="w-full h-full rounded-full object-cover"
                />
              </motion.div>
            </motion.div>

            {/* Profile Details */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <User2 className="h-6 w-6 text-teal-600" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p className="text-base font-semibold text-gray-800">{profile.name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-6 w-6 text-teal-600" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-base font-semibold text-gray-800">{profile.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="h-6 w-6 text-teal-600" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Role</p>
                  <p className="text-base font-semibold text-gray-800 capitalize">{profile.role}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminProfilePage;
