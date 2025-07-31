import api from './api';

//Fetch all events
export const getAllEvents = async () => {
  try {
    const response = await api.get('/api/admin/events');
    return response.data;
    
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to fetch events';
    console.error('Error fetching events:', errorMessage, error);
    throw new Error(errorMessage);
  }
};




// Fetch a single event by ID
export const getEventById = async (id) => {
  try {
    const response = await api.get(`/api/admin/events/${id}`, { withCredentials: true });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || `Failed to fetch event with ID ${id}`;
    console.error(`Error fetching event with ID ${id}:`, errorMessage, error);
    throw new Error(errorMessage);
  }
};

// Create a new event
export const createEvent = async (eventData) => {
  try {
    const response = await api.post('/api/admin/events/create', eventData, { withCredentials: true });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to create event';
    console.error('Error creating event:', errorMessage, error);
    throw new Error(errorMessage);
  }
};

// Update an event
export const updateEvent = async (id, eventData) => {
  try {
    const response = await api.put(`/api/admin/events/edit/${id}`, eventData, { withCredentials: true });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || `Failed to update event with ID ${id}`;
    console.error(`Error updating event with ID ${id}:`, errorMessage, error);
    throw new Error(errorMessage);
  }
};

// Delete an event
export const deleteEvent = async (id) => {
  try {
    const response = await api.delete(`/api/admin/events/delete/${id}`, { withCredentials: true });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || `Failed to delete event with ID ${id}`;
    console.error(`Error deleting event with ID ${id}:`, errorMessage, error);
    throw new Error(errorMessage);
  }
};