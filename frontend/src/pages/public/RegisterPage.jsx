import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';

function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#_\-+])[A-Za-z\d@$!%*?&^#_\-+]{8,}$/;
  const phoneRegex = /^\d{10}$/;

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Phone number must be exactly 10 digits';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!passwordRegex.test(formData.password)) {
      newErrors.password =
        'Password must be at least 8 characters long, include one uppercase letter, one number, and one special character (@$!%*?&^#_-+).';
    }

    if (formData.password && formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    try {
      const response = await api.post('/api/signup', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });

      if (response.status === 201) {
        toast.success('Signup successful! Please verify your email.');
        navigate('/login');
      } else {
        setErrors({ general: response.data?.message || 'Registration failed' });
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'An error occurred. Please try again.';
      setErrors({ general: errorMessage });
      console.error('Error during registration:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    const newErrors = { ...errors };
    if (name === 'name') {
      if (!value.trim()) {
        newErrors.name = 'Full name is required';
      } else {
        delete newErrors.name;
      }
    }
    if (name === 'email') {
      if (!value) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        newErrors.email = 'Invalid email format';
      } else {
        delete newErrors.email;
      }
    }
    if (name === 'phone') {
      if (!value) {
        newErrors.phone = 'Phone number is required';
      } else if (!phoneRegex.test(value)) {
        newErrors.phone = 'Phone number must be exactly 10 digits';
      } else {
        delete newErrors.phone;
      }
    }
    if (name === 'password') {
      if (!value) {
        newErrors.password = 'Password is required';
      } else if (!passwordRegex.test(value)) {
        newErrors.password =
          'Password must be at least 8 characters long, include one uppercase letter, one number, and one special character (@$!%*?&^#_-+).';
      } else {
        delete newErrors.password;
      }
      if (formData.confirmPassword && value !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      } else {
        delete newErrors.confirmPassword;
      }
    }
    if (name === 'confirmPassword') {
      if (formData.password && value !== formData.password) {
        newErrors.confirmPassword = 'Passwords do not match';
      } else {
        delete newErrors.confirmPassword;
      }
    }
    setErrors(newErrors);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1F2A44]">
      <div className="max-w-md w-full p-8 bg-white/15 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20">
        <h2 className="text-center text-3xl font-bold text-white tracking-tight">
          Create your account
        </h2>

        {errors.general && (
          <div className="text-center text-red-400 bg-white/10 p-3 rounded-lg mt-6">{errors.general}</div>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="Full name"
                className={`appearance-none rounded-lg relative block w-full px-4 py-3 bg-white/10 border ${
                  errors.name ? 'border-red-400' : 'border-white/30'
                } placeholder-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 sm:text-sm transition-all`}
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-400">{errors.name}</p>
              )}
            </div>
            <div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="Email address"
                className={`appearance-none rounded-lg relative block w-full px-4 py-3 bg-white/10 border ${
                  errors.email ? 'border-red-400' : 'border-white/30'
                } placeholder-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 sm:text-sm transition-all`}
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email}</p>
              )}
            </div>
            <div>
              <div className="flex rounded-lg">
                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-white/30 bg-white/10 text-white text-sm">
                  <img
                    src="https://flagcdn.com/16x12/np.png"
                    alt="Nepal Flag"
                    className="mr-2"
                  />
                  +977
                </span>
                <input
                  id="phone"
                  name="phone"
                  type="text"
                  required
                  placeholder="10-digit phone number"
                  className={`appearance-none rounded-r-lg relative block w-full px-4 py-3 bg-white/10 border ${
                    errors.phone ? 'border-red-400' : 'border-white/30'
                  } placeholder-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 sm:text-sm transition-all`}
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-400">{errors.phone}</p>
              )}
            </div>
            <div>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="Password"
                className={`appearance-none rounded-lg relative block w-full px-4 py-3 bg-white/10 border ${
                  errors.password ? 'border-red-400' : 'border-white/30'
                } placeholder-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 sm:text-sm transition-all`}
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password ? (
                <p className="mt-1 text-sm text-red-400">{errors.password}</p>
              ) : (
                <p className="mt-1 text-xs text-gray-300">
                  Password must be 8+ characters, with 1 uppercase, 1 number, 1 special character (@$!%*?&^#_-+).
                </p>
              )}
            </div>
            <div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                placeholder="Confirm password"
                className={`appearance-none rounded-lg relative block w-full px-4 py-3 bg-white/10 border ${
                  errors.confirmPassword ? 'border-red-400' : 'border-white/30'
                } placeholder-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 sm:text-sm transition-all`}
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
          >
            Sign up
          </button>

          <div className="text-sm text-center">
            <Link to="/login" className="font-medium text-blue-300 hover:text-blue-200 transition-all">
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;