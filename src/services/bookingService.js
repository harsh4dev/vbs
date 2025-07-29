
import api from './api';

// Check date availability
export const checkDateAvailability = async (eventDate) => {
  try {
    const response = await api.post('/api/admin/bookings/check-date', { event_date: eventDate });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to check date availability';
    console.error('Error checking date availability:', errorMessage, error);
    throw new Error(errorMessage);
  }
};

// Check booking availability
export const checkAvailability = async (eventId, venueId, shiftId, eventDate, guestCount) => {
  try {
    const response = await api.post('/api/admin/bookings/check-availability', {
      event_id: eventId,
      venue_id: venueId,
      shift_id: shiftId,
      event_date: eventDate,
      guest_count: guestCount,
    });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to check availability';
    console.error('Error checking availability:', errorMessage, error);
    throw new Error(errorMessage);
  }
};

// Calculate booking fare
export const calculateFare = async (bookingData) => {
  try {
    const response = await api.post('/api/admin/bookings/calculate-fare', bookingData);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to calculate fare';
    console.error('Error calculating fare:', errorMessage, error);
    throw new Error(errorMessage);
  }
};


// Get all bookings
export const getAllBookings = async () => {
  try {
    const response = await api.get('/api/admin/bookings', { withCredentials: true });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to fetch bookings';
    console.error('Error fetching bookings:', errorMessage, error);
    throw new Error(errorMessage);
  }
};




// Get all bookings for a specific user
export const getUserBookings = async (userId) => {
  try {
    const response = await api.get(`/api/admin/bookings/${userId}`, { withCredentials: true });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to fetch user bookings';
    console.error('Error fetching user bookings:', errorMessage, error);
    throw new Error(errorMessage);
  }
};





// Create a new booking
export const createBooking = async (bookingData) => {
  try {
    const response = await api.post('/api/admin/bookings/store', bookingData, { withCredentials: true });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to create booking';
    console.error('Error creating booking:', errorMessage, error);
    throw new Error(errorMessage);
  }
};

// Update booking status
export const updateBookingStatus = async (bookingId, newStatus) => {
  try {
    const response = await api.patch(`/api/admin/bookings/${bookingId}/status`, { status: newStatus }, { withCredentials: true });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || `Failed to update booking status for ID ${bookingId}`;
    console.error('Error updating booking status:', errorMessage, error);
    throw new Error(errorMessage);
  }
};

// Delete booking
export const deleteBooking = async (bookingId) => {
  try {
    const response = await api.delete(`/api/admin/bookings/${bookingId}`, { withCredentials: true });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || `Failed to delete booking with ID ${bookingId}`;
    console.error('Error deleting booking:', errorMessage, error);
    throw new Error(errorMessage);
  }
};



// Send confirmation email
export const sendConfirmation = async (bookingId, email) => {
  try {
    const response = await api.post('/api/admin/book/send-confirmation', { bookingId, email });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to send confirmation';
    console.error('Error sending confirmation:', errorMessage, error);
    throw new Error(errorMessage);
  }
};



// Create user
export const createUser = async (userData) => {
  try {
    const response = await api.post('/api/admin/users/create', userData);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to create user';
    console.error('Error creating user:', errorMessage, error);
    throw new Error(errorMessage);
  }
};