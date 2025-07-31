import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Plus, Edit, Trash2, XCircle, CheckCircle, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import { getAllVenues, createVenue, updateVenue, deleteVenue } from '../../services/venueService';

const VenuesManagement = () => {
    const [venues, setVenues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ id: null, name: '', capacity: '', image: null });
    const [formErrors, setFormErrors] = useState({});
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const DEFAULT_IMAGE = 'https://noded.harshchaudhary.com.np/default_venue.jpg';

    const mockVenues = [
        { id: 1, name: 'Royal Garden Hall', image: DEFAULT_IMAGE, capacity: 200 },
        { id: 2, name: 'Lakeview Terrace', image: DEFAULT_IMAGE, capacity: 150 },
        { id: 3, name: 'Grand Ballroom', image: DEFAULT_IMAGE, capacity: 300 },
    ];

    const fetchVenues = async () => {
        try {
            setLoading(true);
            const data = await getAllVenues();
            const venuesData = data.venues || data.data || data.results || data || [];
            if (!venuesData.length) {
                setVenues(mockVenues);
            } else {
                setVenues(venuesData); // Backend returns full URLs
            }
        } catch (error) {
            console.error('Error fetching venues:', error);
            setError('Failed to load venues');
            setVenues(mockVenues);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVenues();
    }, []);

    const handleInputChange = (e) => {
        const { name, value, files } = e.target;
        if (files) {
            console.log('Selected file:', files[0]); // Debug: Confirm file selection
            setFormData((prev) => ({ ...prev, [name]: files[0] }));
            setImagePreview(URL.createObjectURL(files[0]));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
        setFormErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.name.trim()) errors.name = 'Venue name is required';
        if (!formData.capacity || formData.capacity <= 0) errors.capacity = 'Valid capacity is required';
        if (!formData.id && !formData.image) errors.image = 'Image is required for new venues';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        try {
            const venueData = new FormData();
            venueData.append('name', formData.name);
            venueData.append('capacity', formData.capacity);
            if (formData.image) {
                console.log('Appending image to FormData:', formData.image); // Debug: Confirm image
                venueData.append('image', formData.image);
            } else {
                console.log('No image appended to FormData'); // Debug: No image
            }

            let response;
            if (formData.id) {
                response = await updateVenue(formData.id, venueData);
                toast.success('Venue updated successfully');
            } else {
                response = await createVenue(venueData);
                toast.success('Venue created successfully');
            }

            await fetchVenues();
            resetForm();
        } catch (error) {
            console.error('Error saving venue:', error.message, error.response?.data);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to save venue';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (venue) => {
        setFormData({
            id: venue.id,
            name: venue.name,
            capacity: venue.capacity,
            image: null,
        });
        setImagePreview(venue.image);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        setLoading(true);
        try {
            await deleteVenue(id);
            setVenues((prev) => prev.filter((venue) => venue.id !== id));
            setDeleteConfirm(null);
            toast.success('Venue deleted successfully');
        } catch (error) {
            console.error('Error deleting venue:', error.message);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to delete venue';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({ id: null, name: '', capacity: '', image: null });
        setFormErrors({});
        if (imagePreview) URL.revokeObjectURL(imagePreview);
        setImagePreview(null);
        setShowForm(false);
    };

    // Rest of the JSX remains unchanged
    // ... (omitted for brevity, keep the existing return statement)
    return (
        <div className="p-6 bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                        <MapPin className="h-8 w-8 text-primary-600 mr-2" />
                        Venues Management
                    </h1>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowForm(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Add Venue
                    </motion.button>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 bg-error-50 p-4 rounded-lg flex items-center"
                    >
                        <XCircle className="h-5 w-5 text-error-500 mr-2" />
                        <p className="text-sm text-error-700">{error}</p>
                    </motion.div>
                )}

                {/* Venues Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {venues.map((venue) => (
                        <motion.div
                            key={venue.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                        >
                            <div className="relative h-48">
                                <img
                                    src={venue.image}
                                    alt={venue.name}
                                    className="w-full h-full object-cover border-b-2 border-gray-100"
                                    onError={(e) => (e.target.src = DEFAULT_IMAGE)}
                                />
                                <div className="absolute top-2 right-2 flex space-x-2">
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => handleEdit(venue)}
                                        className="p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700"
                                        title="Edit Venue"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setDeleteConfirm(venue.id)}
                                        className="p-2 bg-error-600 text-white rounded-full hover:bg-error-700"
                                        title="Delete Venue"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </motion.button>
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="text-lg font-semibold text-gray-900">{venue.name}</h3>
                                <p className="text-sm text-gray-500 flex items-center mt-1">
                                    <MapPin className="h-4 w-4 mr-1" />
                                    Capacity: {venue.capacity}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Venue Form */}
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50"
                    >
                        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative">
                            <button
                                onClick={resetForm}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                            >
                                <XCircle className="h-6 w-6" />
                            </button>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                {formData.id ? 'Edit Venue' : 'Add New Venue'}
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Venue Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-600 focus:ring-primary-600 sm:text-sm transition-all duration-300 ${
                                            formErrors.name ? 'border-error-500' : ''
                                        }`}
                                    />
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: formErrors.name ? 1 : 0 }}
                                        className="mt-1 text-sm text-error-500"
                                    >
                                        {formErrors.name}
                                    </motion.p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Capacity</label>
                                    <input
                                        type="number"
                                        name="capacity"
                                        value={formData.capacity}
                                        onChange={handleInputChange}
                                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-600 focus:ring-primary-600 sm:text-sm transition-all duration-300 ${
                                            formErrors.capacity ? 'border-error-500' : ''
                                        }`}
                                        min="1"
                                    />
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: formErrors.capacity ? 1 : 0 }}
                                        className="mt-1 text-sm text-error-500"
                                    >
                                        {formErrors.capacity}
                                    </motion.p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Image</label>
                                    <div className="mt-1 flex items-center space-x-4">
                                        <input
                                            type="file"
                                            name="image"
                                            accept="image/*"
                                            onChange={handleInputChange}
                                            className={`block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-600 hover:file:bg-primary-100 ${
                                                formErrors.image ? 'border-error-500' : ''
                                            }`}
                                        />
                                        {imagePreview ? (
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="h-16 w-16 object-cover rounded-md border border-gray-200"
                                                onError={(e) => (e.target.src = DEFAULT_IMAGE)}
                                            />
                                        ) : (
                                            <div className="h-16 w-16 bg-gray-100 rounded-md flex items-center justify-center border border-gray-200">
                                                <ImageIcon className="h-8 w-8 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: formErrors.image ? 1 : 0 }}
                                        className="mt-1 text-sm text-error-500"
                                    >
                                        {formErrors.image}
                                    </motion.p>
                                </div>
                                <div className="flex justify-end space-x-3">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        type="button"
                                        onClick={resetForm}
                                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        Cancel
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        type="submit"
                                        disabled={loading}
                                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 flex items-center"
                                    >
                                        {loading ? (
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
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                ></path>
                                            </svg>
                                        ) : null}
                                        {loading ? 'Saving...' : formData.id ? 'Update' : 'Create'}
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
                        className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50"
                    >
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                                <AlertCircle className="h-6 w-6 text-error-500 mr-2" />
                                Confirm Deletion
                            </h2>
                            <p className="text-sm text-gray-600 mb-6">
                                Are you sure you want to delete this venue? This action cannot be undone.
                            </p>
                            <div className="flex justify-end space-x-3">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setDeleteConfirm(null)}
                                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleDelete(deleteConfirm)}
                                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-error-600 hover:bg-error-700 flex items-center"
                                >
                                    {loading ? (
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
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                    ) : null}
                                    {loading ? 'Deleting...' : 'Delete'}
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default VenuesManagement;