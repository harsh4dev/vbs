import api from './api';

// Fetch all shifts
export const getAllShifts = async () => {
  try {
    const response = await api.get('/api/admin/shift', { withCredentials: true });
    // console.log(response.data);
    return response.data;
    
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to fetch shifts';
    console.error('Error fetching shifts:', errorMessage, error);
    throw new Error(errorMessage);
  }
};

// Fetch a single shift by ID
export const getShiftById = async (id) => {
  try {
    const response = await api.get(`/api/admin/bookings/shift/${id}`, { withCredentials: true });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || `Failed to fetch shift with ID ${id}`;
    console.error(`Error fetching shift with ID ${id}:`, errorMessage, error);
    throw new Error(errorMessage);
  }
};

// Create a new shift
export const createShift = async (shiftData) => {
  try {
    const response = await api.post('/api/admin/shift/create', shiftData, { withCredentials: true });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to create shift';
    console.error('Error creating shift:', errorMessage, error);
    throw new Error(errorMessage);
  }
};

// Update a shift
export const updateShift = async (id, shiftData) => {
  try {
    const response = await api.put(`/api/admin/shift/update/${id}`, shiftData, { withCredentials: true });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || `Failed to update shift with ID ${id}`;
    console.error(`Error updating shift with ID ${id}:`, errorMessage, error);
    throw new Error(errorMessage);
  }
};

// Delete a shift
export const deleteShift = async (id) => {
  try {
    const response = await api.delete(`/api/admin/shift/delete/${id}`, { withCredentials: true });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || `Failed to delete shift with ID ${id}`;
    console.error(`Error deleting shift with ID ${id}:`, errorMessage, error);
    throw new Error(errorMessage);
  }
};