import api from './api';

// Fetch all packages
export const getAllPackages = async () => {
  try {
    const response = await api.get('/api/admin/package', { withCredentials: true });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to fetch packages';
    console.error('Error fetching packages:', errorMessage, error);
    throw new Error(errorMessage);
  }
};

// Fetch a single package by ID
export const getPackageById = async (id) => {
  try {
    const response = await api.get(`/api/admin/bookings/package/${id}`, { withCredentials: true });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || `Failed to fetch package with ID ${id}`;
    console.error(`Error fetching package with ID ${id}:`, errorMessage, error);
    throw new Error(errorMessage);
  }
};

// Create a new package
export const createPackage = async (packageData) => {
  try {
    const response = await api.post('/api/admin/package/create', packageData, { withCredentials: true });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to create package';
    console.error('Error creating package:', errorMessage, error);
    throw new Error(errorMessage);
  }
};

// Update a package
export const updatePackage = async (id, packageData) => {
  try {
    const response = await api.put(`/api/admin/package/update/${id}`, packageData, { withCredentials: true });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || `Failed to update package with ID ${id}`;
    console.error(`Error updating package with ID ${id}:`, errorMessage, error);
    throw new Error(errorMessage);
  }
};

// Delete a package
export const deletePackage = async (id) => {
  try {
    const response = await api.delete(`/api/admin/package/delete/${id}`, { withCredentials: true });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || `Failed to delete package with ID ${id}`;
    console.error(`Error deleting package with ID ${id}:`, errorMessage, error);
    throw new Error(errorMessage);
  }
};