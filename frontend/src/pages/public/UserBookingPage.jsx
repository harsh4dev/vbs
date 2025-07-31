import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Calendar, Users, Clock, PartyPopper, Package, Eye, Utensils, Menu, X, User, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getUserBookings } from '../../services/bookingService';
import { getMenuById } from '../../services/menuService';

const UserBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;
  const userId = user?.id;

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('user');
    setMobileMenuOpen(false);
    setDropdownOpen(false);
    window.location.href = '/';
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch bookings
  useEffect(() => {
    const fetchBookings = async () => {
      if (!userId) {
        setError('User not logged in');
        setLoading(false);
        return;
      }

      try {
        const response = await getUserBookings(userId);
        const bookingsData =
          response.bookings ||
          response.data ||
          response.results ||
          response.items ||
          response ||
          [];

        const menuCache = {};

        const finalBookings = await Promise.all(
          (Array.isArray(bookingsData) ? bookingsData : []).map(async (booking) => {
            let menu = { name: 'N/A', items: [] };
            try {
              if (booking.selected_menus) {
                let parsedMenus;
                try {
                  parsedMenus = JSON.parse(booking.selected_menus);
                } catch (jsonError) {
                  console.warn(`Failed to parse selected_menus for booking ${booking.id}:`, jsonError);
                  return { ...booking, menu };
                }

                const menuId = Object.keys(parsedMenus)[0];
                const selectedItems = parsedMenus[menuId] || [];

                if (menuId) {
                  if (!menuCache[menuId]) {
                    try {
                      const menuResponse = await getMenuById(menuId);
                      menuCache[menuId] = menuResponse || { name: 'N/A', items: [] };
                    } catch (menuError) {
                      console.warn(`Failed to fetch menu ID ${menuId}:`, menuError);
                      menuCache[menuId] = { name: 'N/A', items: [] };
                    }
                  }

                  const menuData = menuCache[menuId];
                  let items = [];

                  if (Array.isArray(selectedItems) && selectedItems.length > 0) {
                    if (typeof selectedItems[0] === 'string') {
                      items = selectedItems.map((name) => ({ name }));
                    } else if (typeof selectedItems[0] === 'number') {
                      items = selectedItems
                        .map((index) =>
                          menuData.items && menuData.items[index] ? { name: menuData.items[index].name } : null
                        )
                        .filter(Boolean);
                    } else if (Array.isArray(selectedItems[0])) {
                      items = selectedItems[0].map((item) => ({ name: item.name || 'Unnamed Item' }));
                    }
                  }

                  menu = {
                    name: menuData.name || 'N/A',
                    items,
                  };
                }
              }
            } catch (err) {
              console.warn(`Error processing menu for booking ${booking.id}:`, err);
            }

            return {
              id: booking.id || null,
              event: String(booking.event?.name || booking.event_type?.name || booking.event || booking.event_id || 'N/A'),
              venue_name: String(booking.venue?.name || booking.venue_name || booking.venue || booking.venue_id || 'N/A'),
              package: String(booking.package?.name || booking.package_name?.name || booking.package || booking.package_id || 'N/A'),
              package_id: booking.package_id || null,
              event_date: booking.event_date || booking.date || '',
              shift_name: String(booking.shift?.name || booking.shift_name || booking.shift || booking.shift_id || 'N/A'),
              guest_count: booking.guest_count || booking.guests || 0,
              status: booking.status || 'pending',
              menu,
            };
          })
        );

        setBookings(finalBookings);
        setLoading(false);
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch bookings';
        setError(errorMessage);
        setLoading(false);
      }
    };

    fetchBookings();
  }, [userId]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getFirstName = (name) => {
    if (!name) return 'User';
    return name.split(' ')[0];
  };

  const openModal = (booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-teal-50 to-gray-50">
        <motion.div
          className="animate-spin rounded-full h-12 w-12 border-t-4 border-teal-600"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-gray-50">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 bg-gradient-to-r from-teal-600 to-teal-800 shadow-md py-2">
        <div className="container mx-auto px-4 flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <motion.svg
              className="h-8 w-8 text-white"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              whileHover={{ scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <rect x="3" y="4" width="18" height="16" rx="2" ry="2" />
              <path d="M16 2v4" />
              <path d="M8 2v4" />
              <path d="M3 10h18" />
            </motion.svg>
            <motion.span
              className="text-xl font-bold text-white"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              EventEase
            </motion.span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {[
              { name: 'Home', path: '/' },
              { name: 'Book Venue', path: '/booking' },
              { name: 'About', path: '/about' },
            ].map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `relative text-base font-medium transition-colors duration-300 ${
                    isActive ? 'text-white font-semibold' : 'text-white/90 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {item.name}
                    {isActive && (
                      <motion.div
                        className="absolute -bottom-1 left-0 w-full h-0.5 bg-white"
                        layoutId="underline"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Desktop User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <motion.button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-1"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="relative">
                    <img
                      src="/user_avatar.png"
                      alt="User Avatar"
                      className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/40';
                      }}
                    />
                    <div className="absolute inset-[-2px] rounded-full bg-gradient-to-r from-teal-400 to-teal-600 z-[-1]" />
                  </div>
                  <span className="text-sm font-medium text-white">{getFirstName(user.name)}</span>
                </motion.button>
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-teal-100 overflow-hidden"
                    >
                      <div className="px-4 py-3 text-sm text-teal-700 font-semibold border-b border-teal-100 bg-teal-50">
                        Welcome, {getFirstName(user.name)}
                      </div>
                      <motion.div whileHover={{ backgroundColor: '#E6FFFA' }}>
                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:text-teal-600 transition-colors"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <User className="w-4 h-4 mr-2 text-teal-600" />
                          Profile
                        </Link>
                      </motion.div>
                      <motion.div whileHover={{ backgroundColor: '#E6FFFA' }}>
                        <Link
                          to="/user/booking"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:text-teal-600 transition-colors"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <Calendar className="w-4 h-4 mr-2 text-teal-600" />
                          My Bookings
                        </Link>
                      </motion.div>
                      <motion.div whileHover={{ backgroundColor: '#E6FFFA' }}>
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:text-teal-600 transition-colors"
                        >
                          <LogOut className="w-4 h-4 mr-2 text-teal-600" />
                          Log out
                        </button>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-1 rounded-lg text-sm font-medium text-white hover:bg-white/20 transition-all duration-300"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1 rounded-lg bg-teal-700 text-white text-sm font-medium hover:bg-teal-800 transition-all duration-300 shadow-sm"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            className="md:hidden text-white hover:text-gray-200 focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            whileTap={{ scale: 0.9 }}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="md:hidden mt-4 bg-white rounded-xl shadow-lg mx-4"
            >
              <div className="py-3 space-y-1">
                {[
                  { name: 'Home', path: '/' },
                  { name: 'Book Venue', path: '/booking' },
                  { name: 'About', path: '/about' },
                ].map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `block px-4 py-2 rounded-lg text-base font-medium mx-2 ${
                        isActive ? 'bg-teal-50 text-teal-700' : 'text-gray-700 hover:bg-teal-50 hover:text-teal-600'
                      }`
                    }
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </NavLink>
                ))}
                {user ? (
                  <>
                    <div className="px-4 py-2 text-base font-semibold text-teal-700 bg-teal-50 mx-2 rounded-lg">
                      Welcome, {getFirstName(user.name)}
                    </div>
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-teal-50 hover:text-teal-600 mx-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="w-4 h-4 mr-2 text-teal-600" />
                      Profile
                    </Link>
                    <Link
                      to="/user/booking"
                      className="flex items-center px-4 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-teal-50 hover:text-teal-600 mx-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Calendar className="w-4 h-4 mr-2 text-teal-600" />
                      My Bookings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full text-left px-4 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-teal-50 hover:text-teal-600 mx-2"
                    >
                      <LogOut className="w-4 h-4 mr-2 text-teal-600" />
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="block px-4 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-teal-50 hover:text-teal-600 mx-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      className="block px-4 py-2 rounded-lg text-base font-medium bg-teal-600 text-white hover:bg-teal-700 mx-2"
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
      </header>

      {/* Main Content */}
      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4 md:px-8">
          <motion.h1
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            My Bookings
          </motion.h1>

          {error ? (
            <motion.div
              className="text-center py-16 bg-white rounded-2xl shadow-xl max-w-2xl mx-auto"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <svg className="mx-auto h-24 w-24 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
              <p className="text-gray-600 text-base mb-6 max-w-md mx-auto">{error}</p>
              <Link
                to="/"
                className="inline-block px-8 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Back to Home
              </Link>
            </motion.div>
          ) : bookings.length === 0 ? (
            <motion.div
              className="text-center py-16 bg-white rounded-2xl shadow-xl max-w-2xl mx-auto"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <img
                src="/no-bookings.png"
                alt="No Bookings"
                className="mx-auto h-48 w-48 object-cover mb-6 rounded-lg shadow-md"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/192';
                }}
              />
              <h2 className="text-2xl font-bold text-teal-800 mb-4">No Bookings Yet!</h2>
              <p className="text-gray-600 text-base mb-6 max-w-md mx-auto">
                It looks like you haven’t booked any venues. Start planning your event today!
              </p>
              <Link
                to="/booking"
                className="inline-block px-8 py-3 bg-teal-600 text-white text-base font-semibold rounded-lg hover:bg-teal-700 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Book a Venue Now
              </Link>
            </motion.div>
          ) : (
            <div className="overflow-x-auto bg-white rounded-2xl shadow-xl border border-teal-100">
              <table className="w-full text-left">
                <thead className="bg-teal-600 text-white sticky top-0 z-10">
                  <tr>
                    <th className="py-3 px-4 text-sm font-semibold text-center">Event</th>
                    <th className="py-3 px-4 text-sm font-semibold text-center">Venue</th>
                    <th className="py-3 px-4 text-sm font-semibold text-center">Package</th>
                    <th className="py-3 px-4 text-sm font-semibold text-center">Menu</th>
                    <th className="py-3 px-4 text-sm font-semibold text-center">Date</th>
                    <th className="py-3 px-4 text-sm font-semibold text-center">Shift</th>
                    <th className="py-3 px-4 text-sm font-semibold text-center">Guests</th>
                    <th className="py-3 px-4 text-sm font-semibold text-center">Status</th>
                    <th className="py-3 px-4 text-sm font-semibold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking, index) => (
                    <motion.tr
                      key={booking.id}
                      className={`border-b border-teal-100 hover:bg-teal-50 transition-colors duration-200 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-teal-25'
                      }`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <td className="py-3 px-4 text-gray-700 text-sm text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <PartyPopper className="w-4 h-4 text-teal-600" />
                          <span>{booking.event}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-700 text-sm text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{booking.venue_name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-700 text-sm text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <Package className="w-4 h-4 text-teal-600" />
                          <span>{booking.package}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-700 text-sm text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <Utensils className="w-4 h-4 text-teal-600" />
                          <span>
                            {booking.menu.name === 'N/A' ? 'N/A' : `${booking.menu.name} `}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-700 text-sm text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <Calendar className="w-4 h-4 text-teal-600" />
                          <span>{formatDate(booking.event_date)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-700 text-sm text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <Clock className="w-4 h-4 text-teal-600" />
                          <span>{booking.shift_name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-700 text-sm text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <Users className="w-4 h-4 text-teal-600" />
                          <span>{booking.guest_count}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            booking.status === 'confirmed'
                              ? 'bg-green-100 text-green-700'
                              : booking.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <motion.button
                          onClick={() => openModal(booking)}
                          className="p-2 rounded-full bg-teal-100 text-teal-600 hover:bg-teal-200 transition-all duration-200 shadow-sm"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          aria-label={`View details for booking ${booking.id}`}
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal for Booking Details */}
        <AnimatePresence>
          {isModalOpen && selectedBooking && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
              >
                <div className="bg-gradient-to-r from-teal-600 to-teal-800 p-6">
                  <motion.button
                    onClick={closeModal}
                    className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Close modal"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                  <h2 className="text-2xl font-bold text-white">Booking Details</h2>
                </div>
                <div className="p-6 space-y-3">
                  <div className="flex items-center space-x-2">
                    <PartyPopper className="w-5 h-5 text-teal-600" />
                    <p className="text-gray-700 text-sm">
                      <span className="font-semibold">Event:</span> {selectedBooking.event}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-gray-700 text-sm">
                      <span className="font-semibold">Venue:</span> {selectedBooking.venue_name}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Package className="w-5 h-5 text-teal-600" />
                    <p className="text-gray-700 text-sm">
                      <span className="font-semibold">Package:</span> {selectedBooking.package}
                    </p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Utensils className="w-5 h-5 text-teal-600 mt-1" />
                    <div>
                      <p className="text-gray-700 text-sm">
                        <span className="font-semibold">Menu:</span> {selectedBooking.menu.name}
                      </p>
                      {selectedBooking.menu.items.length > 0 ? (
                        <ul className="mt-1 ml-4 list-disc text-gray-600 text-xs">
                          {selectedBooking.menu.items.map((item, index) => (
                            <li key={index}>{item.name || 'Unnamed Item'}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-600 text-xs mt-1">No menu items available</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-teal-600" />
                    <p className="text-gray-700 text-sm">
                      <span className="font-semibold">Date:</span> {formatDate(selectedBooking.event_date)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-teal-600" />
                    <p className="text-gray-700 text-sm">
                      <span className="font-semibold">Shift:</span> {selectedBooking.shift_name}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-teal-600" />
                    <p className="text-gray-700 text-sm">
                      <span className="font-semibold">Guests:</span> {selectedBooking.guest_count}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="text-gray-700 text-sm">
                      <span className="font-semibold">Status:</span>{' '}
                      <span
                        className={`${
                          selectedBooking.status === 'confirmed'
                            ? 'text-green-700'
                            : selectedBooking.status === 'pending'
                            ? 'text-yellow-700'
                            : 'text-red-700'
                        } font-semibold`}
                      >
                        {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="p-6 pt-0 flex justify-end">
                  <motion.button
                    onClick={closeModal}
                    className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all duration-300 shadow-md hover:shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Close
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default UserBookingsPage;