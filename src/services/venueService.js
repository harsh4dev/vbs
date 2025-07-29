import api from './api';

// Fetch all venues with optional pagination, guest count, and session ID
export const getAllVenues = async (guestCount = null, page = 1, limit = 10) => {
  try {
    const params = { page, limit };
    if (guestCount) params.guestCount = guestCount;
    

    const response = await api.get('/api/admin/venues', {
      params,
      withCredentials: true,
    });
    // console.log(response.data);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to fetch venues';
    console.error('Error fetching venues:', errorMessage, error);
    throw new Error(errorMessage);
  }
};




// Create a new venue
export const createVenue = async (venueData) => {
  try {
    const response = await api.post('/api/admin/venues/create', venueData, {
      withCredentials: true,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to create venue';
    console.error('Error creating venue:', errorMessage, error.response?.data);
    throw new Error(errorMessage);
  }
};

// Update a venue
export const updateVenue = async (id, venueData) => {
  try {
    const response = await api.put(`/api/admin/venues/update/${id}`, venueData, {
      withCredentials: true,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || `Failed to update venue with ID ${id}`;
    console.error(`Error updating venue with ID ${id}:`, errorMessage, error.response?.data);
    throw new Error(errorMessage);
  }
};

// Delete a venue
export const deleteVenue = async (id) => {
  try {
    const response = await api.delete(`/api/admin/venues/delete/${id}`, { withCredentials: true });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || `Failed to delete venue with ID ${id}`;
    console.error(`Error deleting venue with ID ${id}:`, errorMessage, error.response?.data);
    throw new Error(errorMessage);
  }
};

// Check availability for a venue
export const checkAvailability = async (venueId, date, shiftId, sessionId) => {
  try {
    const response = await api.get('/api/admin/bookings/check-availability', {
      params: { venueId, date, shiftId, sessionId },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to check availability';
    console.error('Error checking availability:', errorMessage, error);
    throw new Error(errorMessage);
  }
};