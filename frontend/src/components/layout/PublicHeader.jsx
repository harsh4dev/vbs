import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, User, Calendar, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const PublicHeader = ({ isScrolled }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logoutUser, loading } = useAuth();
  const dropdownRef = useRef(null);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      localStorage.removeItem('user'); // Clear user data from local storage
      setMobileMenuOpen(false);
      setDropdownOpen(false);
      toast.success('Logged out successfully.');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out.');
    }
  };

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Book Venue', path: '/booking' },
    { name: 'About', path: '/about' },
    
  ];

  // Get user's first name
  const getFirstName = (name) => {
    if (!name) return 'User';
    return name.split(' ')[0];
  };

  if (loading) {
    return null; // Prevent rendering until auth state is resolved
  }

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <svg
              className={`h-8 w-8 ${isScrolled ? 'text-teal-700' : 'text-white'}`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="16" rx="2" ry="2" />
              <path d="M16 2v4" />
              <path d="M8 2v4" />
              <path d="M3 10h18" />
            </svg>
            <span
              className={`text-xl font-heading font-bold ${
                isScrolled ? 'text-gray-900' : 'text-white'
              }`}
            >
              EventEase
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  text-base font-medium transition-colors duration-200
                  ${
                    isScrolled
                      ? isActive
                        ? 'text-teal-700'
                        : 'text-gray-700 hover:text-teal-600'
                      : isActive
                        ? 'text-white font-semibold'
                        : 'text-white/80 hover:text-white'
                  }
                `}
              >
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* Authentication Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button onClick={toggleDropdown} className="flex items-center">
                  <div className="relative">
                    <img
                      src="/user_avatar.png"
                      alt="User Avatar"
                      className="w-10 h-10 rounded-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/40';
                      }}
                    />
                    <div className="absolute inset-[-2px] rounded-full avatar-gradient-border" />
                  </div>
                </button>

                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-56 bg-gradient-to-b from-teal-50 to-white rounded-lg shadow-xl border border-teal-100 overflow-hidden z-20"
                  >
                    <div className="px-4 py-3 text-base text-teal-700 font-semibold border-b border-teal-100">
                      Hello, {getFirstName(user.name)}
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="block"
                    >
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-base text-gray-700 hover:bg-teal-100 hover:text-teal-600 transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </Link>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="block"
                    >
                      <Link
                        to="/user/booking"
                        className="flex items-center px-4 py-2 text-base text-gray-700 hover:bg-teal-100 hover:text-teal-600 transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        My Bookings
                      </Link>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="block"
                    >
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full text-left px-4 py-2 text-base text-gray-700 hover:bg-teal-100 hover:text-teal-600 transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Log out
                      </button>
                    </motion.div>
                  </motion.div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`px-4 py-2 rounded transition-colors ${
                    isScrolled
                      ? 'text-gray-900 hover:bg-gray-100'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded bg-teal-600 text-white hover:bg-teal-700 transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-500 hover:text-gray-700 focus:outline-none"
            onClick={toggleMobileMenu}
          >
            {mobileMenuOpen ? (
              <X className={`h-6 w-6 ${isScrolled ? 'text-gray-900' : 'text-white'}`} />
            ) : (
              <Menu className={`h-6 w-6 ${isScrolled ? 'text-gray-900' : 'text-white'}`} />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden mt-4"
            >
              <div className="py-2 space-y-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => `
                      block px-3 py-2 rounded-md text-base font-medium
                      ${
                        isScrolled
                          ? isActive
                            ? 'bg-teal-50 text-teal-700'
                            : 'text-gray-700 hover:bg-gray-50'
                          : isActive
                            ? 'bg-white/10 text-white'
                            : 'text-white/90 hover:bg-white/5'
                      }
                    `}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </NavLink>
                ))}

                {user ? (
                  <>
                    <div className="px-3 py-2 text-base font-semibold text-gray-700">
                      Hello, {getFirstName(user.name)}
                    </div>
                    <Link
                      to="/profile"
                      className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                        isScrolled
                          ? 'text-gray-700 hover:bg-gray-50'
                          : 'text-white/90 hover:bg-white/5'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Link>
                    <Link
                      to="/user/booking"
                      className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                        isScrolled
                          ? 'text-gray-700 hover:bg-gray-50'
                          : 'text-white/90 hover:bg-white/5'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      My Bookings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className={`flex items-center w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                        isScrolled
                          ? 'text-gray-700 hover:bg-gray-50'
                          : 'text-white/90 hover:bg-white/5'
                      }`}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className={`block px-3 py-2 rounded-md text-base font-medium ${
                        isScrolled
                          ? 'text-gray-700 hover:bg-gray-50'
                          : 'text-white/90 hover:bg-white/5'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      className="block px-3 py-2 rounded-md text-base font-medium bg-teal-600 text-white hover:bg-teal-700"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Custom CSS for gradient border */}
      <style>
        {`
          .avatar-gradient-border::before {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            border-radius: 50%;
            background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888);
            z-index: -1;
          }
        `}
      </style>
    </header>
  );
};

export default PublicHeader;