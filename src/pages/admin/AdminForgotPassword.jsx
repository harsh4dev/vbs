import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

function AdminForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await api.post(`${backendUrl}api/admin/forgot-password`, { email });
      setMessage(response.data.message);
    } catch (err) {
      console.error('Forgot password error:', err);
      setError(err.response?.data?.message || 'Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1E2A55] via-[#2A3A6A] to-[#1A5C6B]">
      <div className="max-w-sm w-full p-8 bg-white/10 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/20 animate-slide-in-up">
        <h2 className="text-center text-3xl font-bold text-white tracking-tight">
          Admin Password Reset
        </h2>
        <p className="mt-2 text-center text-sm text-gray-200">
          Enter your email address to receive a password reset link.
        </p>

        {message && (
          <div className="text-center text-teal-400 bg-white/10 p-3 rounded-lg mt-4 animate-fade-in">
            {message}
          </div>
        )}
        {error && (
          <div className="text-center text-red-400 bg-white/10 p-3 rounded-lg mt-4 animate-fade-in">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email-address" className="sr-only">Email address</label>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none rounded-lg relative block w-full px-4 py-3 bg-white/10 border border-white/20 placeholder-gray-200 text-white focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 sm:text-sm transition-all duration-300 hover:scale-105 hover:border-teal-300"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:scale-100"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="text-sm text-center mt-4">
          <Link
            to="/aonecafe/admin/login"
            className="font-medium text-teal-300 hover:text-teal-200 transition-all duration-300"
          >
            Back to Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AdminForgotPassword;