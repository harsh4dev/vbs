
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Users,
  Calendar,
  ArrowUp,
  ArrowDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MapPin,
  Package,
  DollarSign,
} from 'lucide-react';
import { Tooltip } from 'react-tooltip';
import { getAllBookings } from '../../services/bookingService';
import { getAllEvents } from '../../services/eventService';
import { getAllVenues } from '../../services/venueService';
import { getAllShifts } from '../../services/shiftService';
import { getAllPackages } from '../../services/packageService';
import { getAllUsers } from '../../services/userService';
import { formatDate } from './utils';

const Dashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [packages, setPackages] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    cancelledBookings: 0,
    bookingChange: 0,
    totalRevenue: 0,
  });

  // Fetch bookings and related data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [userData, bookingData, eventData, venueData, shiftData, packageData] = await Promise.all([
          getAllUsers(),
          getAllBookings(),
          getAllEvents(),
          getAllVenues(),
          getAllShifts(),
          getAllPackages(),
        ]);

        // Normalize booking data to include user_name and user_email
        const normalizedBookings = Array.isArray(bookingData)
          ? bookingData.map((booking) => {
              const user = Array.isArray(userData) ? userData.find((u) => u.id === booking.user_id) : null;
              return {
                ...booking,
                id: String(booking.id),
                user_name: user?.name || booking.user_name || 'Unknown',
                user_email: user?.email || booking.user_email || 'N/A',
                venue_id: booking.venue_id ? String(booking.venue_id) : null,
              };
            })
          : [];

        setUsers(Array.isArray(userData) ? userData : []);
        setBookings(normalizedBookings);
        calculateStats(normalizedBookings);
        setEvents(Array.isArray(eventData) ? eventData : []);
        setVenues(Array.isArray(venueData.venues) ? venueData.venues : Array.isArray(venueData) ? venueData : []);
        setShifts(Array.isArray(shiftData) ? shiftData : []);
        setPackages(Array.isArray(packageData) ? packageData : []);

        // Debug data
        console.log('Bookings:', normalizedBookings);
        console.log('Venues:', venues);
        console.log('Events:', events);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load dashboard data');
        setUsers([]);
        setBookings([]);
        calculateStats([]);
        setEvents([]);
        setVenues([]);
        setShifts([]);
        setPackages([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calculate dashboard stats
  const calculateStats = (bookings) => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const pendingBookings = bookings.filter((booking) => booking.status === 'pending');
    const confirmedBookings = bookings.filter((booking) => booking.status === 'confirmed');
    const cancelledBookings = bookings.filter((booking) => booking.status === 'cancelled');

    const currentMonthBookings = bookings.filter((booking) => {
      const bookingDate = new Date(booking.created_at);
      return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
    });

    const previousMonthBookings = bookings.filter((booking) => {
      const bookingDate = new Date(booking.created_at);
      return bookingDate.getMonth() === previousMonth && bookingDate.getFullYear() === previousMonthYear;
    });

    const bookingChange = previousMonthBookings.length !== 0
      ? ((currentMonthBookings.length - previousMonthBookings.length) / previousMonthBookings.length) * 100
      : currentMonthBookings.length > 0
      ? 100
      : 0;

    const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.total_fare || 0), 0);

    setStats({
      totalBookings: bookings.length,
      pendingBookings: pendingBookings.length,
      confirmedBookings: confirmedBookings.length,
      cancelledBookings: cancelledBookings.length,
      bookingChange,
      totalRevenue,
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-4 w-4 mr-1.5" />
            Confirmed
          </span>
        );
      case 'pending':
        return (
          <span className="flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <AlertCircle className="h-4 w-4 mr-1.5" />
            Pending
          </span>
        );
      case 'cancelled':
        return (
          <span className="flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="h-4 w-4 mr-1.5" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  // Filter recent bookings
  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 flex items-center">
            <BarChart className="h-10 w-10 text-indigo-600 mr-3" />
            Dashboard
          </h1>
          <p className="text-gray-600 mt-2 text-lg">Your venue bookings at a glance, beautifully presented.</p>
        </header>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-50 p-4 rounded-xl flex items-center shadow-md"
            data-tooltip-id="error-tooltip"
            data-tooltip-content="An error occurred while loading data"
          >
            <XCircle className="h-5 w-5 text-red-600 mr-2" />
            <p className="text-sm text-red-700">{error}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.reload()}
              className="ml-auto px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Retry
            </motion.button>
          </motion.div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Total Bookings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.03, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
            className="bg-white rounded-xl shadow-2xl border border-gray-200 p-6 bg-gradient-to-br from-indigo-50 to-purple-50"
            data-tooltip-id="total-bookings"
            data-tooltip-content="Total bookings this month"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Total Bookings</h3>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="p-2 bg-indigo-100 rounded-full"
              >
                <Calendar className="h-8 w-8 text-indigo-600" />
              </motion.div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-4xl font-extrabold text-gray-900">{stats.totalBookings}</p>
                <div className="flex items-center mt-2">
                  {stats.bookingChange >= 0 ? (
                    <>
                      <ArrowUp className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-700">
                        {Math.abs(stats.bookingChange).toFixed(1)}%
                      </span>
                    </>
                  ) : (
                    <>
                      <ArrowDown className="h-5 w-5 text-red-600" />
                      <span className="text-sm font-medium text-red-700">
                        {Math.abs(stats.bookingChange).toFixed(1)}%
                      </span>
                    </>
                  )}
                  <span className="text-xs text-gray-500 ml-1">vs last month</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Revenue Now */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.03, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
            className="bg-white rounded-xl shadow-2xl border border-gray-200 p-6 bg-gradient-to-br from-indigo-50 to-purple-50"
            data-tooltip-id="revenue"
            data-tooltip-content="Total revenue from all bookings"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Revenue Now</h3>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="p-2 bg-green-100 rounded-full"
              >
                <DollarSign className="h-8 w-8 text-green-600" />
              </motion.div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-4xl font-extrabold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
                <p className="text-xs text-gray-500 mt-2">From all bookings</p>
              </div>
            </div>
          </motion.div>

          {/* Pending Approvals */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.03, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
            className="bg-white rounded-xl shadow-2xl border border-gray-200 p-6 bg-gradient-to-br from-indigo-50 to-purple-50"
            data-tooltip-id="pending-approvals"
            data-tooltip-content="Bookings awaiting approval"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Pending Approvals</h3>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="p-2 bg-yellow-100 rounded-full"
              >
                <Clock className="h-8 w-8 text-yellow-600" />
              </motion.div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-4xl font-extrabold text-gray-900">{stats.pendingBookings}</p>
                <p className="text-xs text-gray-500 mt-2">Requires action</p>
              </div>
              <div className="text-xs text-white bg-yellow-600 py-1 px-2 rounded-full">
                {stats.pendingBookings > 0 ? 'Action needed' : 'All clear'}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Bookings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-2xl border border-gray-200 p-6 lg:col-span-2"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                <Calendar className="h-6 w-6 text-indigo-600 mr-2" />
                Recent Bookings
              </h3>
              <a
                href="/aonecafe/admin/bookings"
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                data-tooltip-id="view-all-bookings"
                data-tooltip-content="View all bookings"
              >
                View All
              </a>
            </div>
            {recentBookings.length === 0 ? (
              <div className="p-8 text-center">
                <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Recent Bookings</h3>
                <p className="text-gray-500">No bookings available in the system</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 sticky top-0 z-10">
                    <tr>
                      <th
                        className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider"
                        data-tooltip-id="col-booking-id"
                        data-tooltip-content="Unique booking identifier"
                      >
                        Booking ID
                      </th>
                      <th
                        className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider"
                        data-tooltip-id="col-date"
                        data-tooltip-content="Event date"
                      >
                        Date
                      </th>
                      <th
                        className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider"
                        data-tooltip-id="col-customer"
                        data-tooltip-content="Customer details"
                      >
                        Customer
                      </th>
                      <th
                        className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider"
                        data-tooltip-id="col-venue"
                        data-tooltip-content="Venue and event type"
                      >
                        Venue
                      </th>
                      <th
                        className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider"
                        data-tooltip-id="col-guests"
                        data-tooltip-content="Number of guests"
                      >
                        Guests
                      </th>
                      <th
                        className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider"
                        data-tooltip-id="col-status"
                        data-tooltip-content="Booking status"
                      >
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {recentBookings.map((booking, index) => (
                      <motion.tr
                        key={booking.id || index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className={`${
                          index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                        } hover:bg-indigo-50 transition-colors`}
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">
                            #{String(booking.id).substring(0, 8)}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-sm text-gray-700">{formatDate(booking.event_date)}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div>
                            <span className="text-sm font-medium text-gray-900">{booking.user_name || 'N/A'}</span>
                            <p className="text-xs text-gray-500">{booking.user_email || 'N/A'}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div>
                            <span className="text-sm text-gray-900">
                              {venues.find((v) => String(v.id) === booking.venue_id)?.name || 'N/A'}
                            </span>
                            <p className="text-xs text-gray-500">
                              {events.find((e) => e.id === booking.event_id)?.name || 'N/A'}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-sm text-gray-700">{booking.guest_count || 'N/A'}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">{getStatusBadge(booking.status)}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>

          {/* Booking Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-2xl border border-gray-200 p-6"
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <BarChart className="h-6 w-6 text-indigo-600 mr-2" />
              Booking Status
            </h3>
            <div className="space-y-8">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Confirmed</span>
                  <span className="text-sm text-gray-600">
                    {stats.confirmedBookings}/{stats.totalBookings}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <motion.div
                    className="bg-gradient-to-r from-green-500 to-green-700 h-4 rounded-full"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${
                        stats.totalBookings > 0 ? (stats.confirmedBookings / stats.totalBookings) * 100 : 0
                      }%`,
                    }}
                    transition={{ duration: 0.5 }}
                  ></motion.div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Pending</span>
                  <span className="text-sm text-gray-600">
                    {stats.pendingBookings}/{stats.totalBookings}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <motion.div
                    className="bg-gradient-to-r from-yellow-500 to-yellow-700 h-4 rounded-full"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${
                        stats.totalBookings > 0 ? (stats.pendingBookings / stats.totalBookings) * 100 : 0
                      }%`,
                    }}
                    transition={{ duration: 0.5 }}
                  ></motion.div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Cancelled</span>
                  <span className="text-sm text-gray-600">
                    {stats.cancelledBookings}/{stats.totalBookings}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <motion.div
                    className="bg-gradient-to-r from-red-500 to-red-700 h-4 rounded-full"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${
                        stats.totalBookings > 0 ? (stats.cancelledBookings / stats.totalBookings) * 100 : 0
                      }%`,
                    }}
                    transition={{ duration: 0.5 }}
                  ></motion.div>
                </div>
              </div>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-4 text-center">
              <motion.div
                className="p-4 bg-green-100 rounded-lg"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 }}
                data-tooltip-id="status-confirmed"
                data-tooltip-content="Confirmed bookings"
              >
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-1" />
                <p className="text-xs font-medium text-green-700">Confirmed</p>
                <p className="text-xl font-bold text-green-800">{stats.confirmedBookings}</p>
              </motion.div>
              <motion.div
                className="p-4 bg-yellow-100 rounded-lg"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                data-tooltip-id="status-pending"
                data-tooltip-content="Pending bookings"
              >
                <AlertCircle className="h-8 w-8 text-yellow-600 mx-auto mb-1" />
                <p className="text-xs font-medium text-yellow-700">Pending</p>
                <p className="text-xl font-bold text-yellow-800">{stats.pendingBookings}</p>
              </motion.div>
              <motion.div
                className="p-4 bg-red-100 rounded-lg"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
                data-tooltip-id="status-cancelled"
                data-tooltip-content="Cancelled bookings"
              >
                <XCircle className="h-8 w-8 text-red-600 mx-auto mb-1" />
                <p className="text-xs font-medium text-red-700">Cancelled</p>
                <p className="text-xl font-bold text-red-800">{stats.cancelledBookings}</p>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <a
            href="/aonecafe/admin/bookings"
            className="bg-white p-6 rounded-xl border border-gray-200 shadow-2xl flex items-center justify-between bg-gradient-to-br from-indigo-50 to-purple-50 transition-transform transform hover:scale-105 hover:shadow-xl"
            data-tooltip-id="action-bookings"
            data-tooltip-content="Manage all bookings"
          >
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-1">Manage Bookings</h3>
              <p className="text-sm text-gray-500">View and update all bookings</p>
            </div>
            <motion.div whileHover={{ rotate: 15 }} transition={{ duration: 0.3 }}>
              <Calendar className="h-12 w-12 text-indigo-600" />
            </motion.div>
          </a>
          <a
            href="/aonecafe/admin/venues"
            className="bg-white p-6 rounded-xl border border-gray-200 shadow-2xl flex items-center justify-between bg-gradient-to-br from-indigo-50 to-purple-50 transition-transform transform hover:scale-105 hover:shadow-xl"
            data-tooltip-id="action-venues"
            data-tooltip-content="Manage venue details"
          >
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-1">Manage Venues</h3>
              <p className="text-sm text-gray-500">Update venue details</p>
            </div>
            <motion.div whileHover={{ rotate: 15 }} transition={{ duration: 0.3 }}>
              <MapPin className="h-12 w-12 text-indigo-600" />
            </motion.div>
          </a>
          <a
            href="/aonecafe/admin/packages"
            className="bg-white p-6 rounded-xl border border-gray-200 shadow-2xl flex items-center justify-between bg-gradient-to-br from-indigo-50 to-purple-50 transition-transform transform hover:scale-105 hover:shadow-xl"
            data-tooltip-id="action-packages"
            data-tooltip-content="Manage package pricing"
          >
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-1">Manage Packages</h3>
              <p className="text-sm text-gray-500">Update package pricing</p>
            </div>
            <motion.div whileHover={{ rotate: 15 }} transition={{ duration: 0.3 }}>
              <Package className="h-12 w-12 text-indigo-600" />
            </motion.div>
          </a>
          <a
            href="/aonecafe/admin/users"
            className="bg-white p-6 rounded-xl border border-gray-200 shadow-2xl flex items-center justify-between bg-gradient-to-br from-indigo-50 to-purple-50 transition-transform transform hover:scale-105 hover:shadow-xl"
            data-tooltip-id="action-users"
            data-tooltip-content="Manage customer accounts"
          >
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-1">Manage Users</h3>
              <p className="text-sm text-gray-500">View customer accounts</p>
            </div>
            <motion.div whileHover={{ rotate: 15 }} transition={{ duration: 0.3 }}>
              <Users className="h-12 w-12 text-indigo-600" />
            </motion.div>
          </a>
        </motion.div>

        {/* Tooltips */}
        <Tooltip id="error-tooltip" />
        <Tooltip id="total-bookings" />
        <Tooltip id="revenue" />
        <Tooltip id="pending-approvals" />
        <Tooltip id="view-all-bookings" />
        <Tooltip id="col-booking-id" />
        <Tooltip id="col-date" />
        <Tooltip id="col-customer" />
        <Tooltip id="col-venue" />
        <Tooltip id="col-guests" />
        <Tooltip id="col-status" />
        <Tooltip id="status-confirmed" />
        <Tooltip id="status-pending" />
        <Tooltip id="status-cancelled" />
        <Tooltip id="action-bookings" />
        <Tooltip id="action-venues" />
        <Tooltip id="action-packages" />
        <Tooltip id="action-users" />
      </div>
    </div>
  );
};

export default Dashboard;
