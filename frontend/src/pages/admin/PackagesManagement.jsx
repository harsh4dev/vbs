import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Plus, Edit, Trash2, XCircle, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { getAllPackages, createPackage, updatePackage, deletePackage } from '../../services/packageService';

// Format price in NPR
const formatNPR = (value) =>
  new Intl.NumberFormat('en-NP', {
    style: 'currency',
    currency: 'NPR',
    minimumFractionDigits: 0,
  }).format(value);

const PackagesManagement = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: '', base_price: '' });
  const [formErrors, setFormErrors] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Fetch packages
  useEffect(() => {
    const fetchPackages = async () => {
      setLoading(true);
      try {
        const data = await getAllPackages();
        console.log('Fetched packages:', JSON.stringify(data, null, 2));
        setPackages(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching packages:', error.message);
        setError('Failed to load packages. Please try again.');
        setPackages([]);
        toast.error('Failed to load packages', { icon: <XCircle className="h-5 w-5" /> });
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'base_price' ? value.replace(/[^0-9.]/g, '') : value,
    }));
    setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Package name is required';
    if (!formData.base_price || parseFloat(formData.base_price) <= 0) {
      errors.base_price = 'Base price must be a positive number';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix form errors before submitting', { icon: <XCircle className="h-5 w-5" /> });
      return;
    }

    setLoading(true);
    try {
      const packageData = {
        name: formData.name.trim(),
        base_price: parseFloat(formData.base_price),
      };
      console.log('Submitting package:', JSON.stringify(packageData, null, 2));

      if (formData.id) {
        const response = await updatePackage(formData.id, packageData);
        console.log('Update response:', JSON.stringify(response, null, 2));
        if (!response.id) {
          console.warn('Incomplete update response, refetching packages');
          const updatedPackages = await getAllPackages();
          setPackages(Array.isArray(updatedPackages) ? updatedPackages : []);
        } else {
          setPackages((prev) =>
            prev.map((pkg) => (pkg.id === formData.id ? { ...pkg, ...response } : pkg))
          );
        }
        toast.success('Package updated successfully', { icon: <CheckCircle className="h-5 w-5" /> });
      } else {
        const response = await createPackage(packageData);
        console.log('Create response:', JSON.stringify(response, null, 2));
        if (!response.id) {
          console.warn('Incomplete create response, refetching packages');
          const updatedPackages = await getAllPackages();
          setPackages(Array.isArray(updatedPackages) ? updatedPackages : []);
        } else {
          setPackages((prev) => [...prev, response]);
        }
        toast.success('Package created successfully', { icon: <CheckCircle className="h-5 w-5" /> });
      }

      resetForm();
    } catch (error) {
      console.error('Error saving package:', error.message, error.response?.data);
      const errorMessage = error.message.includes('referenced')
        ? 'Cannot save package; it is referenced by existing data.'
        : 'Failed to save package';
      setError(errorMessage);
      toast.error(errorMessage, { icon: <XCircle className="h-5 w-5" /> });
    } finally {
      setLoading(false);
    }
  };

  // Handle edit package
  const handleEdit = (pkg) => {
    console.log('Editing package:', JSON.stringify(pkg, null, 2));
    setFormData({ id: pkg.id, name: pkg.name, base_price: pkg.base_price.toString() });
    setShowForm(true);
  };

  // Handle delete package
  const handleDelete = async (id) => {
    setLoading(true);
    try {
      console.log('Deleting package ID:', id);
      await deletePackage(id);
      setPackages((prev) => prev.filter((pkg) => pkg.id !== id));
      setDeleteConfirm(null);
      toast.success('Package deleted successfully', { icon: <CheckCircle className="h-5 w-5" /> });
    } catch (error) {
      console.error('Error deleting package:', error.message);
      const errorMessage = error.message.includes('referenced')
        ? 'Cannot delete package; it is referenced by existing data.'
        : 'Failed to delete package';
      setError(errorMessage);
      toast.error(errorMessage, { icon: <XCircle className="h-5 w-5" /> });
    } finally {
      setLoading(false);
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = (id) => {
    console.log('Opening delete confirmation for package ID:', id);
    setDeleteConfirm(id);
  };

  // Reset form
  const resetForm = () => {
    setFormData({ id: null, name: '', base_price: '' });
    setFormErrors({});
    setShowForm(false);
  };

  // Handle click outside to close form or dialog
  const handleClickOutside = (e) => {
    if ((showForm || deleteConfirm) && e.target.className.includes('bg-gray-600')) {
      resetForm();
      setDeleteConfirm(null);
    }
  };

  if (loading && packages.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div
      className="p-6 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 min-h-screen relative"
      style={{
        backgroundImage:
          'url("data:image/svg+xml,%3Csvg width=20 height=20 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Ccircle cx=2 cy=2 r=1 fill=%22%23e2e8f0%22/%3E%3C/svg%3E")',
      }}
      onClick={handleClickOutside}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 flex items-center">
            <Package className="h-10 w-10 text-primary-600 mr-3" />
            Packages Management
          </h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-lg shadow-md hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300"
            aria-label="Add new package"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Package
          </motion.button>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-8 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-center shadow-md"
          >
            <XCircle className="h-6 w-6 text-red-500 mr-3" />
            <p className="text-sm text-red-700 flex-1">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="ml-4 px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </motion.div>
        )}

        {/* Empty State */}
        {packages.length === 0 && !loading && (
          <div className="bg-white rounded-2xl shadow-lg p-10 text-center">
            <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">No Packages Found</h3>
            <p className="text-gray-500 text-lg">Create a new package to get started.</p>
          </div>
        )}

        {/* Packages Grid */}
        {packages.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center mb-2">
                    <Package className="h-6 w-6 text-primary-600 mr-2" />
                    {pkg.name || 'Unnamed Package'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Base Price:{' '}
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {formatNPR(pkg.base_price || 0)}
                    </span>
                  </p>
                  <div className="mt-4 flex space-x-4">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleEdit(pkg)}
                      className="p-3 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors relative group"
                      title="Edit Package"
                      aria-label={`Edit ${pkg.name}`}
                    >
                      <Edit className="h-6 w-6" />
                      <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 -top-8 left-1/2 transform

 -translate-x-1/2">
                        Edit
                      </span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeleteConfirm(pkg.id)}
                      className="p-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors relative group"
                      title="Delete Package"
                      aria-label={`Delete ${pkg.name}`}
                    >
                      <Trash2 className="h-6 w-6" />
                      <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 -top-8 left-1/2 transform -translate-x-1/2">
                        Delete
                      </span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Package Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50"
              role="dialog"
              aria-labelledby="form-title"
            >
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
                <button
                  onClick={resetForm}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  aria-label="Close form"
                >
                  <XCircle className="h-7 w-7" />
                </button>
                <h2 id="form-title" className="text-3xl font-bold text-gray-900 mb-6">
                  {formData.id ? 'Edit Package' : 'Add New Package'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Package Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-600 focus:ring-primary-600 sm:text-sm transition-all duration-300 hover:border-gray-400 ${
                        formErrors.name ? 'border-red-500' : ''
                      }`}
                      placeholder="e.g., Premium Package"
                      aria-invalid={formErrors.name ? 'true' : 'false'}
                      aria-describedby={formErrors.name ? 'name-error' : undefined}
                    />
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: formErrors.name ? 1 : 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-1 text-sm text-red-500 flex items-center"
                    >
                      {formErrors.name && <AlertCircle className="h-4 w-4 mr-1" />}
                      {formErrors.name}
                    </motion.p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Base Price (NPR)</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₨</span>
                      <input
                        type="text"
                        name="base_price"
                        value={formData.base_price}
                        onChange={handleInputChange}
                        className={`block w-full pl-8 rounded-lg border-gray-300 shadow-sm focus:border-primary-600 focus:ring-primary-600 sm:text-sm transition-all duration-300 hover:border-gray-400 ${
                          formErrors.base_price ? 'border-red-500' : ''
                        }`}
                        placeholder="e.g., 5000"
                        pattern="[0-9]*\.?[0-9]*"
                        aria-invalid={formErrors.base_price ? 'true' : 'false'}
                        aria-describedby={formErrors.base_price ? 'base-price-error' : undefined}
                      />
                    </div>
                    {formData.base_price && (
                      <p className="mt-1 text-xs text-gray-500">
                        {formatNPR(parseFloat(formData.base_price) || 0)}
                      </p>
                    )}
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: formErrors.base_price ? 1 : 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-1 text-sm text-red-500 flex items-center"
                    >
                      {formErrors.base_price && <AlertCircle className="h-4 w-4 mr-1" />}
                      {formErrors.base_price}
                    </motion.p>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={resetForm}
                      className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
                      aria-label="Cancel form"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      disabled={loading}
                      className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-lg shadow-md hover:from-primary-700 hover:to-primary-800 disabled:bg-primary-400 disabled:cursor-not-allowed flex items-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600"
                      aria-label={formData.id ? 'Update package' : 'Create package'}
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
                      {loading ? 'Saving...' : formData.id ? 'Update Package' : 'Create Package'}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation */}
        <AnimatePresence>
          {deleteConfirm && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50"
              role="dialog"
              aria-labelledby="delete-title"
            >
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
                <h2 id="delete-title" className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <AlertCircle className="h-7 w-7 text-red-500 mr-2" />
                  Confirm Deletion
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  Are you sure you want to delete this package? This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setDeleteConfirm(null)}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
                    aria-label="Cancel deletion"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDelete(deleteConfirm)}
                    className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-lg shadow-md hover:from-red-700 hover:to-red-800 flex items-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600"
                    aria-label="Confirm deletion"
                  >
                    {loading && (
                      <svg
                        className="animate-spin h-6 w-6 mr-2 text-white"
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
                    {loading ? 'Deleting...' : 'Delete Package'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PackagesManagement;