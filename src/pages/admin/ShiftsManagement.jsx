import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Plus, Edit, Trash2, XCircle, AlertCircle } from 'lucide-react';
import { getAllShifts, createShift, updateShift, deleteShift } from '../../services/shiftService';

const ShiftsManagement = () => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    description: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Fetch shifts
  useEffect(() => {
    const fetchShifts = async () => {
      setLoading(true);
      try {
        const data = await getAllShifts();
        console.log('Fetched shifts:', JSON.stringify(data, null, 2));
        setShifts(Array.isArray(data.shifts) ? data.shifts : data || []);
      } catch (error) {
        console.error('Error fetching shifts:', error.message);
        setError('Failed to load shifts. Please try again.');
        setShifts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchShifts();
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
    if (!formData.name.trim()) errors.name = 'Shift name is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const shiftData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
      };
      console.log('Submitting shift:', JSON.stringify(shiftData, null, 2));

      if (formData.id) {
        const response = await updateShift(formData.id, shiftData);
        console.log('Update response:', JSON.stringify(response, null, 2));
        // Fallback: Refetch if response is incomplete
        if (!response.id) {
          console.warn('Incomplete update response, refetching shifts');
          const updatedShifts = await getAllShifts();
          setShifts(Array.isArray(updatedShifts.shifts) ? updatedShifts.shifts : updatedShifts || []);
        } else {
          setShifts((prev) =>
            prev.map((shift) =>
              shift.id === formData.id ? { ...shift, ...response } : shift
            )
          );
        }
      } else {
        const response = await createShift(shiftData);
        console.log('Create response:', JSON.stringify(response, null, 2));
        // Fallback: Refetch if response is incomplete
        if (!response.id) {
          console.warn('Incomplete create response, refetching shifts');
          const updatedShifts = await getAllShifts();
          setShifts(Array.isArray(updatedShifts.shifts) ? updatedShifts.shifts : updatedShifts || []);
        } else {
          setShifts((prev) => [...prev, response]);
        }
      }

      resetForm();
    } catch (error) {
      console.error('Error saving shift:', error.message);
      setError('Failed to save shift. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit shift
  const handleEdit = (shift) => {
    console.log('Editing shift:', JSON.stringify(shift, null, 2));
    setFormData({
      id: shift.id,
      name: shift.name || '',
      description: shift.description || '',
    });
    setShowForm(true);
  };

  // Handle delete shift
  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await deleteShift(id);
      setShifts((prev) => prev.filter((shift) => shift.id !== id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting shift:', error.message);
      setError('Failed to delete shift. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      id: null,
      name: '',
      description: '',
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

  if (loading && shifts.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen" onClick={handleClickOutside}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Clock className="h-8 w-8 text-primary-600 mr-2" />
            Shifts Management
          </h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-lg shadow-md hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Shift
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

        {/* Empty State */}
        {shifts.length === 0 && !loading && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Shifts Found</h3>
            <p className="text-gray-500">Create a new shift to get started.</p>
          </div>
        )}

        {/* Shift Cards */}
        {shifts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {shifts.map((shift) => (
              <motion.div
                key={shift.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
              >
                <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-2">
                  <Clock className="h-5 w-5 text-primary-600 mr-2" />
                  {shift.name || 'Unnamed Shift'}
                </h3>
                {/* <p className="text-sm text-gray-600 line-clamp-2">
                  {shift.description || 'No description provided'}
                </p> */}
                <div className="mt-4 flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleEdit(shift)}
                    className="p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors"
                    title="Edit Shift"
                  >
                    <Edit className="h-4 w-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setDeleteConfirm(shift.id)}
                    className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                    title="Delete Shift"
                  >
                    <Trash2 className="h-4 w-4" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Shift Form Modal */}
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
                {formData.id ? 'Edit Shift' : 'Create Shift'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shift Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-600 focus:ring-primary-600 sm:text-sm transition-all duration-300 hover:border-gray-400 ${formErrors.name ? 'border-red-500' : ''}`}
                    placeholder="e.g., Morning Shift"
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-600 focus:ring-primary-600 sm:text-sm transition-all duration-300 hover:border-gray-400"
                    placeholder="e.g., Shift for morning events"
                    rows="4"
                  />
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
                    className="px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-lg shadow-md hover:from-primary-700 hover:to-primary-800 disabled:bg-primary-400 disabled:cursor-not-allowed flex items-center transition-all duration-300"
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
                    {loading ? 'Saving...' : formData.id ? 'Update Shift' : 'Create Shift'}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {/* Delete Confirmation */}
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
                Are you sure you want to delete this shift? This action cannot be undone.
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
                  {loading ? 'Deleting...' : 'Delete Shift'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ShiftsManagement;