
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreVertical,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Eye,
  Trash2,
  Download,
  ChevronDown,
  Columns,
} from 'lucide-react';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Tooltip } from 'react-tooltip';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { getAllBookings, updateBookingStatus, deleteBooking } from '../../services/bookingService';
import { getAllEvents } from '../../services/eventService';
import { getAllVenues } from '../../services/venueService';
import { getAllShifts } from '../../services/shiftService';
import { getAllPackages } from '../../services/packageService';
import { getAllUsers } from '../../services/userService';

const BookingsManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [packages, setPackages] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedVenue, setSelectedVenue] = useState('all');
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [openActionMenu, setOpenActionMenu] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);
  const [selectedBookings, setSelectedBookings] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [columnVisibility, setColumnVisibility] = useState({
    id: true,
    customer: true,
    venue: true,
    guests: true,
    amount: true,
    status: true,
  });
  const [exportPreviewOpen, setExportPreviewOpen] = useState(false);
  const [exportType, setExportType] = useState(null);
  const [exportColumns, setExportColumns] = useState({
    id: true,
    customer: true,
    email: true,
    venue: true,
    event: true,
    event_date: true,
    guests: true,
    amount: true,
    status: true,
    created_at: true,
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

        // Normalize booking data
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
        setFilteredBookings(normalizedBookings);
        setEvents(Array.isArray(eventData) ? eventData : []);
        setVenues(Array.isArray(venueData.venues) ? venueData.venues : Array.isArray(venueData) ? venueData : []);
        setShifts(Array.isArray(shiftData) ? shiftData : []);
        setPackages(Array.isArray(packageData) ? packageData : []);

        // Debug venues
        console.log('Venues State:', venues);
        console.log('Venue Names:', venues.map((v) => v.name));
        console.log('Booking Venue IDs:', normalizedBookings.map((b) => b.venue_id));
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load bookings or related data');
        setBookings([]);
        setFilteredBookings([]);
        setUsers([]);
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

  // Filter bookings
  useEffect(() => {
    let result = bookings;
    
    if (selectedStatus !== 'all') {
      result = result.filter((booking) => booking.status === selectedStatus);
    }
    
    if (selectedVenue !== 'all') {
      result = result.filter((booking) => booking.venue_id === selectedVenue);
    }
    
    if (startDate && endDate) {
      result = result.filter((booking) => {
        const eventDate = new Date(booking.event_date);
        return eventDate >= startDate && eventDate <= endDate;
      });
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((booking) => {
        const eventName = events.find((e) => e.id === booking.event_id)?.name?.toLowerCase() || '';
        const venueName = venues.find((v) => String(v.id) === booking.venue_id)?.name?.toLowerCase() || '';
        return (
          (booking.id && String(booking.id).toLowerCase().includes(query)) ||
          (booking.user_name && booking.user_name.toLowerCase().includes(query)) ||
          (booking.user_email && booking.user_email.toLowerCase().includes(query)) ||
          eventName.includes(query) ||
          venueName.includes(query)
        );
      });
    }
    
    setFilteredBookings(result);
    setCurrentPage(1);
  }, [searchQuery, selectedStatus, selectedVenue, dateRange, bookings, events, venues]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? 'N/A'
      : date.toLocaleDateString('en-US', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
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

  // Handle action menu toggle
  const toggleActionMenu = (bookingId) => {
    setOpenActionMenu(openActionMenu === bookingId ? null : bookingId);
  };

  // Handle view booking
  const handleViewBooking = (booking) => {
    setSelectedBooking(booking);
    setViewModalOpen(true);
    setOpenActionMenu(null);
  };

  // Handle update status
  const handleUpdateStatus = async (bookingId, newStatus) => {
    setStatusUpdateLoading(true);
    try {
      await updateBookingStatus(bookingId, newStatus);
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === bookingId ? { ...booking, status: newStatus } : booking
        )
      );
      setFilteredBookings((prev) =>
        prev.map((booking) =>
          booking.id === bookingId ? { ...booking, status: newStatus } : booking
        )
      );
      setSelectedBooking((prev) =>
        prev && prev.id === bookingId ? { ...prev, status: newStatus } : prev
      );
      toast.success(`Booking status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error('Failed to update booking status');
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  // Handle bulk actions
  const handleBulkAction = async () => {
    if (!bulkAction || selectedBookings.length === 0) return;
    
    if (bulkAction === 'delete') {
      try {
        await Promise.all(selectedBookings.map((id) => deleteBooking(id)));
        setBookings((prev) => prev.filter((booking) => !selectedBookings.includes(booking.id)));
        setFilteredBookings((prev) => prev.filter((booking) => !selectedBookings.includes(booking.id)));
        toast.success(`${selectedBookings.length} bookings deleted successfully`);
        setSelectedBookings([]);
        setBulkAction('');
      } catch (error) {
        console.error('Error deleting bookings:', error);
        toast.error('Failed to delete bookings');
      }
    } else {
      try {
        await Promise.all(
          selectedBookings.map((id) => updateBookingStatus(id, bulkAction))
        );
        setBookings((prev) =>
          prev.map((booking) =>
            selectedBookings.includes(booking.id) ? { ...booking, status: bulkAction } : booking
          )
        );
        setFilteredBookings((prev) =>
          prev.map((booking) =>
            selectedBookings.includes(booking.id) ? { ...booking, status: bulkAction } : booking
          )
        );
        toast.success(`${selectedBookings.length} bookings updated to ${bulkAction}`);
        setSelectedBookings([]);
        setBulkAction('');
      } catch (error) {
        console.error('Error updating bookings:', error);
        toast.error('Failed to update bookings');
      }
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = (booking) => {
    setBookingToDelete(booking);
    setDeleteConfirmOpen(true);
    setOpenActionMenu(null);
  };

  // Handle delete booking
  const handleDeleteBooking = async () => {
    if (!bookingToDelete) return;
    
    try {
      await deleteBooking(bookingToDelete.id);
      setBookings((prev) => prev.filter((booking) => booking.id !== bookingToDelete.id));
      setFilteredBookings((prev) => prev.filter((booking) => booking.id !== bookingToDelete.id));
      toast.success('Booking deleted successfully');
      setDeleteConfirmOpen(false);
      if (selectedBooking?.id === bookingToDelete.id) {
        setViewModalOpen(false);
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
      toast.error('Failed to delete booking');
    }
  };

  // Handle column visibility
  const toggleColumn = (column) => {
    setColumnVisibility((prev) => ({ ...prev, [column]: !prev[column] }));
  };

  // Export to CSV
  const exportToCSV = (data, selectedColumns) => {
    const headers = [];
    const keys = [];
    if (selectedColumns.id) {
      headers.push('Booking ID');
      keys.push('id');
    }
    if (selectedColumns.customer) {
      headers.push('Customer Name');
      keys.push('user_name');
    }
    if (selectedColumns.email) {
      headers.push('Email');
      keys.push('user_email');
    }
    if (selectedColumns.venue) {
      headers.push('Venue');
      keys.push('venue_id');
    }
    if (selectedColumns.event) {
      headers.push('Event');
      keys.push('event_id');
    }
    if (selectedColumns.event_date) {
      headers.push('Event Date');
      keys.push('event_date');
    }
    if (selectedColumns.guests) {
      headers.push('Guests');
      keys.push('guest_count');
    }
    if (selectedColumns.amount) {
      headers.push('Amount');
      keys.push('total_fare');
    }
    if (selectedColumns.status) {
      headers.push('Status');
      keys.push('status');
    }
    if (selectedColumns.created_at) {
      headers.push('Created At');
      keys.push('created_at');
    }

    const rows = data.map((booking) => {
      const row = [];
      keys.forEach((key) => {
        if (key === 'venue_id') {
          const venue = venues.find((v) => String(v.id) === booking.venue_id);
          row.push(venue?.name || 'N/A');
        } else if (key === 'event_id') {
          row.push(events.find((e) => e.id === booking.event_id)?.name || 'N/A');
        } else if (key === 'event_date' || key === 'created_at') {
          row.push(formatDate(booking[key]));
        } else if (key === 'total_fare') {
          row.push(formatCurrency(booking[key] || 0));
        } else {
          row.push(booking[key] || 'N/A');
        }
      });
      return row;
    });

    const csvContent = [
      headers.map((h) => `"${h}"`).join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `bookings_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  // Export to PDF
  const exportToPDF = (data, selectedColumns) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Bookings Report', 20, 20);
    
    const headers = [];
    const keys = [];
    if (selectedColumns.id) {
      headers.push('Booking ID');
      keys.push('id');
    }
    if (selectedColumns.customer) {
      headers.push('Customer Name');
      keys.push('user_name');
    }
    if (selectedColumns.email) {
      headers.push('Email');
      keys.push('user_email');
    }
    if (selectedColumns.venue) {
      headers.push('Venue');
      keys.push('venue_id');
    }
    if (selectedColumns.event) {
      headers.push('Event');
      keys.push('event_id');
    }
    if (selectedColumns.event_date) {
      headers.push('Event Date');
      keys.push('event_date');
    }
    if (selectedColumns.guests) {
      headers.push('Guests');
      keys.push('guest_count');
    }
    if (selectedColumns.amount) {
      headers.push('Amount');
      keys.push('total_fare');
    }
    if (selectedColumns.status) {
      headers.push('Status');
      keys.push('status');
    }
    if (selectedColumns.created_at) {
      headers.push('Created At');
      keys.push('created_at');
    }

    const rows = data.map((booking) => {
      const row = [];
      keys.forEach((key) => {
        if (key === 'venue_id') {
          const venue = venues.find((v) => String(v.id) === booking.venue_id);
          row.push(venue?.name || 'N/A');
        } else if (key === 'event_id') {
          row.push(events.find((e) => e.id === booking.event_id)?.name || 'N/A');
        } else if (key === 'event_date' || key === 'created_at') {
          row.push(formatDate(booking[key]));
        } else if (key === 'total_fare') {
          row.push(formatCurrency(booking[key] || 0));
        } else {
          row.push(booking[key] || 'N/A');
        }
      });
      return row;
    });

    doc.autoTable({
      head: [headers],
      body: rows,
      startY: 30,
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [99, 102, 241], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    doc.save(`bookings_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Export single booking to PDF
  const exportBookingToPDF = (booking) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Booking Details - #${booking.id}`, 20, 20);
    
    let y = 30;
    const addDetail = (label, value) => {
      doc.setFontSize(12);
      doc.text(`${label}:`, 20, y);
      doc.setFontSize(10);
      doc.text(value || 'N/A', 60, y);
      y += 10;
    };

    addDetail('Customer Name', booking.user_name);
    addDetail('Email', booking.user_email);
    addDetail('Venue', venues.find((v) => String(v.id) === booking.venue_id)?.name);
    addDetail('Event', events.find((e) => e.id === booking.event_id)?.name);
    addDetail('Event Date', formatDate(booking.event_date));
    addDetail('Shift', shifts.find((s) => s.id === booking.shift_id)?.name);
    addDetail('Guests', booking.guest_count?.toString());
    addDetail('Package', packages.find((p) => p.id === booking.package_id)?.name);
    addDetail('Total Amount', formatCurrency(booking.total_fare || 0));
    addDetail('Status', booking.status);
    addDetail('Created At', formatDate(booking.created_at));

    if (booking.menu_items?.length) {
      doc.setFontSize(12);
      doc.text('Menu Items:', 20, y);
      y += 10;
      doc.autoTable({
        head: [['Name', 'Price']],
        body: booking.menu_items.map((item) => [item.name, `₹${item.price}`]),
        startY: y,
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [99, 102, 241], textColor: [255, 255, 255] },
      });
    }

    doc.save(`booking_${booking.id}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Handle export preview
  const handleExportPreview = (type) => {
    setExportType(type);
    setExportPreviewOpen(true);
  };

  // Handle export confirmation
  const handleExport = () => {
    if (exportType === 'csv') {
      exportToCSV(filteredBookings, exportColumns);
    } else if (exportType === 'pdf') {
      exportToPDF(filteredBookings, exportColumns);
    }
    setExportPreviewOpen(false);
    setExportType(null);
    toast.success(`Exported as ${exportType.toUpperCase()} successfully`);
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBookings.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Select all bookings on current page
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedBookings(currentItems.map((booking) => booking.id));
    } else {
      setSelectedBookings([]);
    }
  };

  // Memoized table columns
  const tableColumns = useMemo(
    () => [
      { key: 'select', label: '', visible: true },
      { key: 'id', label: 'ID / Date', visible: columnVisibility.id },
      { key: 'customer', label: 'Customer', visible: columnVisibility.customer },
      { key: 'venue', label: 'Venue / Event', visible: columnVisibility.venue },
      { key: 'guests', label: 'Guests', visible: columnVisibility.guests },
      { key: 'amount', label: 'Amount', visible: columnVisibility.amount },
      { key: 'status', label: 'Status', visible: columnVisibility.status },
      { key: 'actions', label: 'Actions', visible: true },
    ],
    [columnVisibility]
  );

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
            <Calendar className="h-10 w-10 text-indigo-600 mr-3" />
            Bookings Management
          </h1>
          <p className="text-gray-600 mt-2 text-lg">Manage, export, and analyze venue bookings with ease.</p>
        </header>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-50 p-4 rounded-xl flex items-center shadow-md"
          >
            <XCircle className="h-5 w-5 text-red-600 mr-2" />
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="ml-auto px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Retry
            </button>
          </motion.div>
        )}

        {/* Filters, Search, and Export */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by ID, customer, venue, or event..."
                className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all duration-300"
              />
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center">
                <Filter className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-700">Filters:</span>
              </div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                data-tooltip-id="status-filter"
                data-tooltip-content="Filter by booking status"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select
                value={selectedVenue}
                onChange={(e) => setSelectedVenue(e.target.value)}
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                data-tooltip-id="venue-filter"
                data-tooltip-content="Filter by venue"
              >
                <option value="all">All Venues</option>
                {venues.map((venue) => (
                  <option key={venue.id} value={venue.id}>
                    {venue.name}
                  </option>
                ))}
              </select>
              <DatePicker
                selectsRange
                startDate={startDate}
                endDate={endDate}
                onChange={(update) => setDateRange(update)}
                placeholderText="Select date range"
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 w-full lg:w-auto"
                data-tooltip-id="date-filter"
                data-tooltip-content="Filter by event date range"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 mt-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleExportPreview('csv')}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              data-tooltip-id="export-csv"
              data-tooltip-content="Export bookings to CSV"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleExportPreview('pdf')}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              data-tooltip-id="export-pdf"
              data-tooltip-content="Export bookings to PDF"
            >
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </motion.button>
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                data-tooltip-id="columns"
                data-tooltip-content="Customize table columns"
              >
                <Columns className="h-4 w-4 mr-2" />
                Columns
                <ChevronDown className="h-4 w-4 ml-2" />
              </motion.button>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-10 border border-gray-200"
                style={{ display: columnVisibility.dropdownOpen ? 'block' : 'none' }}
              >
                {['id', 'customer', 'venue', 'guests', 'amount', 'status'].map((col) => (
                  <label key={col} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50">
                    <input
                      type="checkbox"
                      checked={columnVisibility[col]}
                      onChange={() => toggleColumn(col)}
                      className="mr-2"
                    />
                    {col.charAt(0).toUpperCase() + col.slice(1)}
                  </label>
                ))}
              </motion.div>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedBookings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-indigo-50 p-4 rounded-xl flex items-center justify-between shadow-md"
          >
            <div className="text-sm text-gray-700">
              <span className="font-medium">{selectedBookings.length}</span> booking(s) selected
            </div>
            <div className="flex items-center gap-4">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                data-tooltip-id="bulk-action"
                data-tooltip-content="Apply action to selected bookings"
              >
                <option value="">Select Action</option>
                <option value="confirmed">Mark as Confirmed</option>
                <option value="pending">Mark as Pending</option>
                <option value="cancelled">Mark as Cancelled</option>
                <option value="delete">Delete</option>
              </select>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBulkAction}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                disabled={!bulkAction}
              >
                Apply
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Bookings Table */}
        <div className="bg-white rounded-xl shadow-2xl border border-gray-200 mb-6 overflow-hidden">
          {filteredBookings.length === 0 ? (
            <div className="p-8 text-center">
              <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Bookings Found</h3>
              <p className="text-gray-500">
                {searchQuery || selectedStatus !== 'all' || selectedVenue !== 'all' || (startDate && endDate)
                  ? 'Try adjusting your search or filter criteria'
                  : 'No bookings available in the system'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 sticky top-0 z-10">
                  <tr>
                    {tableColumns.map(
                      (col) =>
                        col.visible && (
                          <th
                            key={col.key}
                            className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider"
                          >
                            {col.key === 'select' ? (
                              <input
                                type="checkbox"
                                onChange={handleSelectAll}
                                checked={selectedBookings.length === currentItems.length && currentItems.length > 0}
                                className="h-4 w-4 text-indigo-600"
                              />
                            ) : (
                              col.label
                            )}
                          </th>
                        )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentItems.map((booking, index) => (
                    <motion.tr
                      key={booking.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className={`${
                        index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                      } hover:bg-indigo-50 transition-colors`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedBookings.includes(booking.id)}
                          onChange={() =>
                            setSelectedBookings((prev) =>
                              prev.includes(booking.id)
                                ? prev.filter((id) => id !== booking.id)
                                : [...prev, booking.id]
                            )
                          }
                          className="h-4 w-4 text-indigo-600"
                        />
                      </td>
                      {columnVisibility.id && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            #{String(booking.id).substring(0, 8)}
                          </div>
                          <div className="text-xs text-gray-500">{formatDate(booking.event_date)}</div>
                        </td>
                      )}
                      {columnVisibility.customer && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{booking.user_name || 'N/A'}</div>
                          <div className="text-xs text-gray-500">{booking.user_email || 'N/A'}</div>
                        </td>
                      )}
                      {columnVisibility.venue && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {venues.find((v) => String(v.id) === booking.venue_id)?.name || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {events.find((e) => e.id === booking.event_id)?.name || 'N/A'}
                          </div>
                        </td>
                      )}
                      {columnVisibility.guests && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {booking.guest_count || 'N/A'}
                        </td>
                      )}
                      {columnVisibility.amount && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(booking.total_fare || 0)}
                        </td>
                      )}
                      {columnVisibility.status && (
                        <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(booking.status)}</td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => toggleActionMenu(booking.id)}
                          className="text-gray-500 hover:text-gray-700"
                          data-tooltip-id={`action-${booking.id}`}
                          data-tooltip-content="More actions"
                        >
                          <MoreVertical className="h-5 w-5" />
                        </motion.button>
                        {openActionMenu === booking.id && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute right-4 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-10 border border-gray-200"
                          >
                            <button
                              onClick={() => handleViewBooking(booking)}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
                            >
                              <Eye className="h-4 w-4 mr-2 text-indigo-600" />
                              View Details
                            </button>
                            {booking.status !== 'confirmed' && (
                              <button
                                onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                                className="flex items-center w-full px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                              >
                                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                Mark as Confirmed
                              </button>
                            )}
                            {booking.status !== 'pending' && (
                              <button
                                onClick={() => handleUpdateStatus(booking.id, 'pending')}
                                className="flex items-center w-full px-4 py-2 text-sm text-yellow-700 hover:bg-yellow-50"
                              >
                                <AlertCircle className="h-4 w-4 mr-2 text-yellow-600" />
                                Mark as Pending
                              </button>
                            )}
                            {booking.status !== 'cancelled' && (
                              <button
                                onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                                className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                              >
                                <XCircle className="h-4 w-4 mr-2 text-red-600" />
                                Mark as Cancelled
                              </button>
                            )}
                            <div className="border-t border-gray-100 my-1"></div>
                            <button
                              onClick={() => handleDeleteConfirm(booking)}
                              className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4 mr-2 text-red-600" />
                              Delete Booking
                            </button>
                          </motion.div>
                        )}
                        <Tooltip id={`action-${booking.id}`} />
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredBookings.length > 0 && (
          <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-md">
            <div className="text-sm text-gray-600">
              Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
              <span className="font-medium">{Math.min(indexOfLastItem, filteredBookings.length)}</span> of{' '}
              <span className="font-medium">{filteredBookings.length}</span> results
            </div>
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg ${
                  currentPage === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-700'
                }`}
              >
                Previous
              </motion.button>
              {Array.from({ length: totalPages }).map((_, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePageChange(index + 1)}
                  className={`px-4 py-2 rounded-lg ${
                    currentPage === index + 1
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-700'
                  }`}
                >
                  {index + 1}
                </motion.button>
              ))}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg ${
                  currentPage === totalPages
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-700'
                }`}
              >
                Next
              </motion.button>
            </div>
          </div>
        )}

        {/* View Booking Modal */}
        <AnimatePresence>
          {viewModalOpen && selectedBooking && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50"
              onClick={() => setViewModalOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-purple-50">
                  <h3 className="text-2xl font-semibold text-gray-900 flex items-center">
                    <Calendar className="h-6 w-6 text-indigo-600 mr-2" />
                    Booking Details
                  </h3>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setViewModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </motion.button>
                </div>
                <div className="px-6 py-6">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <span className="text-sm text-gray-500">Booking ID</span>
                      <p className="text-lg font-semibold text-gray-900">#{selectedBooking.id}</p>
                    </div>
                    {getStatusBadge(selectedBooking.status)}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-indigo-50 rounded-xl p-6 shadow-sm">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Booking Information</h4>
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <Calendar className="h-5 w-5 text-indigo-600 mt-0.5 mr-3" />
                          <div>
                            <span className="text-sm text-gray-500">Event Date</span>
                            <p className="text-sm font-medium text-gray-900">
                              {formatDate(selectedBooking.event_date)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <MapPin className="h-5 w-5 text-indigo-600 mt-0.5 mr-3" />
                          <div>
                            <span className="text-sm text-gray-500">Venue / Shift</span>
                            <p className="text-sm font-medium text-gray-900">
                              {venues.find((v) => String(v.id) === selectedBooking.venue_id)?.name || 'N/A'} /{' '}
                              {shifts.find((s) => s.id === selectedBooking.shift_id)?.name || 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <Users className="h-5 w-5 text-indigo-600 mt-0.5 mr-3" />
                          <div>
                            <span className="text-sm text-gray-500">Event Type / Guests</span>
                            <p className="text-sm font-medium text-gray-900">
                              {events.find((e) => e.id === selectedBooking.event_id)?.name || 'N/A'} /{' '}
                              {selectedBooking.guest_count} guests
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <DollarSign className="h-5 w-5 text-indigo-600 mt-0.5 mr-3" />
                          <div>
                            <span className="text-sm text-gray-500">Total Amount</span>
                            <p className="text-sm font-medium text-gray-900">
                              {formatCurrency(selectedBooking.total_fare || 0)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <Calendar className="h-5 w-5 text-indigo-600 mt-0.5 mr-3" />
                          <div>
                            <span className="text-sm text-gray-500">Booking Created</span>
                            <p className="text-sm font-medium text-gray-900">
                              {formatDate(selectedBooking.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-indigo-50 rounded-xl p-6 shadow-sm">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Customer Information</h4>
                      <div className="space-y-4">
                        <div>
                          <span className="text-sm text-gray-500">Name</span>
                          <p className="text-sm font-medium text-gray-900">
                            {selectedBooking.user_name || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Email</span>
                          <p className="text-sm font-medium text-gray-900">
                            {selectedBooking.user_email || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-indigo-50 rounded-xl p-6 mb-8 shadow-sm">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Package & Menu</h4>
                    <div className="space-y-4">
                      <div>
                        <span className="text-sm text-gray-500">Package</span>
                        <p className="text-sm font-medium text-gray-900">
                          {packages.find((p) => p.id === selectedBooking.package_id)?.name || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Selected Menu Items</span>
                        <ul className="list-disc pl-5 text-sm text-gray-900">
                          {selectedBooking.menu_items?.map((item, index) => (
                            <li key={index}>
                              {item.name} (₹{item.price})
                            </li>
                          )) || <p className="text-sm text-gray-500">None</p>}
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="bg-indigo-50 rounded-xl p-6 shadow-sm">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Update Status</h4>
                    <div className="flex flex-wrap gap-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleUpdateStatus(selectedBooking.id, 'confirmed')}
                        disabled={selectedBooking.status === 'confirmed' || statusUpdateLoading}
                        className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium ${
                          selectedBooking.status === 'confirmed'
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Confirm Booking
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleUpdateStatus(selectedBooking.id, 'pending')}
                        disabled={selectedBooking.status === 'pending' || statusUpdateLoading}
                        className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium ${
                          selectedBooking.status === 'pending'
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        }`}
                      >
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Mark as Pending
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleUpdateStatus(selectedBooking.id, 'cancelled')}
                        disabled={selectedBooking.status === 'cancelled' || statusUpdateLoading}
                        className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium ${
                          selectedBooking.status === 'cancelled'
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Cancel Booking
                      </motion.button>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-4 mt-6">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => exportBookingToPDF(selectedBooking)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      data-tooltip-id="export-booking-pdf"
                      data-tooltip-content="Export this booking to PDF"
                    >
                      Export PDF
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDeleteConfirm(selectedBooking)}
                      className="px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      Delete Booking
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setViewModalOpen(false)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Close
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {deleteConfirmOpen && bookingToDelete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-8">
                  <div className="flex items-center justify-center mb-4">
                    <div className="bg-red-100 p-3 rounded-full">
                      <Trash2 className="h-8 w-8 text-red-600" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 text-center mb-3">
                    Delete Booking
                  </h3>
                  <p className="text-gray-600 text-center mb-6">
                    Are you sure you want to delete the booking for{' '}
                    <span className="font-medium">{bookingToDelete.user_name || 'Unknown Customer'}</span>? This action
                    cannot be undone.
                  </p>
                  <div className="flex justify-center space-x-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setDeleteConfirmOpen(false)}
                      className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleDeleteBooking}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Export Preview Modal */}
        <AnimatePresence>
          {exportPreviewOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50"
              onClick={() => setExportPreviewOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-purple-50">
                  <h3 className="text-2xl font-semibold text-gray-900">
                    Preview {exportType === 'csv' ? 'CSV' : 'PDF'} Export
                  </h3>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setExportPreviewOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </motion.button>
                </div>
                <div className="px-6 py-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Select Columns to Export</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    {Object.keys(exportColumns).map((col) => (
                      <label key={col} className="flex items-center text-sm text-gray-700">
                        <input
                          type="checkbox"
                          checked={exportColumns[col]}
                          onChange={() =>
                            setExportColumns((prev) => ({ ...prev, [col]: !prev[col] }))
                          }
                          className="mr-2"
                        />
                        {col
                          .replace('_', ' ')
                          .replace(/\b\w/g, (c) => c.toUpperCase())}
                      </label>
                    ))}
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Data Preview</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-indigo-600">
                        <tr>
                          {Object.keys(exportColumns)
                            .filter((col) => exportColumns[col])
                            .map((col) => (
                              <th
                                key={col}
                                className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider"
                              >
                                {col
                                  .replace('_', ' ')
                                  .replace(/\b\w/g, (c) => c.toUpperCase())}
                              </th>
                            ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredBookings.slice(0, 5).map((booking) => (
                          <tr key={booking.id} className="bg-white">
                            {exportColumns.id && (
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                #{String(booking.id).substring(0, 8)}
                              </td>
                            )}
                            {exportColumns.customer && (
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {booking.user_name || 'N/A'}
                              </td>
                            )}
                            {exportColumns.email && (
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {booking.user_email || 'N/A'}
                              </td>
                            )}
                            {exportColumns.venue && (
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {venues.find((v) => String(v.id) === booking.venue_id)?.name || 'N/A'}
                              </td>
                            )}
                            {exportColumns.event && (
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {events.find((e) => e.id === booking.event_id)?.name || 'N/A'}
                              </td>
                            )}
                            {exportColumns.event_date && (
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatDate(booking.event_date)}
                              </td>
                            )}
                            {exportColumns.guests && (
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {booking.guest_count || 'N/A'}
                              </td>
                            )}
                            {exportColumns.amount && (
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatCurrency(booking.total_fare || 0)}
                              </td>
                            )}
                            {exportColumns.status && (
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {booking.status}
                              </td>
                            )}
                            {exportColumns.created_at && (
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatDate(booking.created_at)}
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex justify-end space-x-4 mt-6">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setExportPreviewOpen(false)}
                      className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleExport}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Export {exportType === 'csv' ? 'CSV' : 'PDF'}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tooltips */}
        <Tooltip id="status-filter" />
        <Tooltip id="venue-filter" />
        <Tooltip id="date-filter" />
        <Tooltip id="export-csv" />
        <Tooltip id="export-pdf" />
        <Tooltip id="export-booking-pdf" />
        <Tooltip id="columns" />
        <Tooltip id="bulk-action" />
      </div>
    </div>
  );
};

export default BookingsManagement;
