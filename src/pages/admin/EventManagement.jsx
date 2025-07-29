import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Plus, Edit, Trash2, XCircle, AlertCircle } from 'lucide-react';
import { getAllEvents, createEvent, updateEvent, deleteEvent } from '../../services/eventService';

const EventManagement = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    name: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const data = await getAllEvents();
        console.log('Fetched events:', JSON.stringify(data, null, 2));
        setEvents(Array.isArray(data) ? data : data.events || []);
      } catch (error) {
        console.error('Error fetching events:', error.message);
        setError('Failed to load events. Please try again.');
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Event name is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const eventData = {
        name: formData.name.trim(),
      };
      console.log('Submitting event:', JSON.stringify(eventData, null, 2));

      if (formData.id) {
        const response = await updateEvent(formData.id, eventData);
        console.log('Update response:', JSON.stringify(response, null, 2));
        if (!response.id) {
          console.warn('Incomplete update response, refetching events');
          const updatedEvents = await getAllEvents();
          setEvents(Array.isArray(updatedEvents) ? updatedEvents : updatedEvents.events || []);
        } else {
          setEvents((prev) =>
            prev.map((event) =>
              event.id === formData.id ? { ...event, ...response } : event
            )
          );
        }
      } else {
        const response = await createEvent(eventData);
        console.log('Create response:', JSON.stringify(response, null, 2));
        if (!response.id) {
          console.warn('Incomplete create response, refetching events');
          const updatedEvents = await getAllEvents();
          setEvents(Array.isArray(updatedEvents) ? updatedEvents : updatedEvents.events || []);
        } else {
          setEvents((prev) => [...prev, response]);
        }
      }

      resetForm();
    } catch (error) {
      console.error('Error saving event:', error.message);
      setError('Failed to save event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit event
  const handleEdit = (event) => {
    console.log('Editing event:', JSON.stringify(event, null, 2));
    setFormData({
      id: event.id,
      name: event.name || '',
    });
    setShowForm(true);
  };

  // Handle delete event
  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await deleteEvent(id);
      setEvents((prev) => prev.filter((event) => event.id !== id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting event:', error.message);
      setError('Failed to delete event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      id: null,
      name: '',
    });
    setFormErrors({});
    setShowForm(false);
  };

  // Handle click outside to close form
  const handleClickOutside = (e) => {
    if (showForm && e.target.className.includes('bg-black')) {
      resetForm();
    }
  };

  if (loading && events.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen" onClick={handleClickOutside}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Calendar className="h-8 w-8 text-blue-600 mr-2" />
            Events Management
          </h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg shadow-md hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Event
          </motion.button>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-center shadow-md"
          >
            <XCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="ml-auto px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </motion.div>
        )}

        {events.length === 0 && !loading && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Events Found</h3>
            <p className="text-gray-500">Create a new event to get started.</p>
          </div>
        )}

        {events.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
              >
                <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-2">
                  <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                  {event.name || 'Unnamed Event'}
                </h3>
                <div className="mt-4 flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleEdit(event)}
                    className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                    title="Edit Event"
                  >
                    <Edit className="h-4 w-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setDeleteConfirm(event.id)}
                    className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                    title="Delete Event"
                  >
                    <Trash2 className="h-4 w-4" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {showForm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
              <button
                onClick={resetForm}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="h-6 w-6" />
              </button>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {formData.id ? 'Edit Event' : 'Create Event'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 sm:text-sm transition-all duration-300 hover:border-gray-400 ${formErrors.name ? 'border-red-500' : ''}`}
                    placeholder="e.g., Annual Conference"
                  />
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: formErrors.name ? 1 : 0 }}
                    className="mt-1 text-sm text-red-500 flex items-center"
                  >
                    {formErrors.name && <AlertCircle className="h-4 w-4 mr-1" />}
                    {formErrors.name}
                  </motion.p>
                </div>
                <div className="flex justify-end space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg shadow-md hover:from-blue-700 hover:to-blue-800 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center transition-all duration-300"
                  >
                    {loading && (
                      <svg
                        className="animate-spin h-5 w-5 mr-2 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                    )}
                    {loading ? 'Saving...' : formData.id ? 'Update Event' : 'Create Event'}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <AlertCircle className="h-6 w-6 text-red-500 mr-2" />
                Confirm Deletion
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to delete this event? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDelete(deleteConfirm)}
                  className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 flex items-center transition-colors"
                >
                  {loading && (
                    <svg
                      className="animate-spin h-5 w-5 mr-2 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                  )}
                  {loading ? 'Deleting...' : 'Delete Event'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default EventManagement;