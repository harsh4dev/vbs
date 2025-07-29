import api from './api';

// Fetch all users with pagination
export const getAllUsers = async (page = 1, limit = 10) => {
  try {
    const response = await api.get(`/api/admin/users`, { withCredentials: true });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to fetch users';
    console.error('Error fetching users:', errorMessage, error);
    throw new Error(errorMessage);
  }
};

// Fetch a single user by ID
export const createUser = async (id) => {
  try {
    const response = await api.post(`/api/signup`, { withCredentials: true });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || `Failed to fetch user with ID ${id}`;
    console.error(`Error fetching user with ID ${id}:`, errorMessage, error);
    throw new Error(errorMessage);
  }
};

// Update a user
export const updateUser = async (id, userData) => {
  try {
    const response = await api.put(`/api/user/update/${id}`, userData, { withCredentials: true });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || `Failed to update user with ID ${id}`;
    console.error(`Error updating user with ID ${id}:`, errorMessage, error);
    throw new Error(errorMessage);
  }
};

// Delete a user
export const deleteUser = async (id) => {
  try {
    const response = await api.delete(`/api/delete/${id}`, { withCredentials: true });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || `Failed to delete user with ID ${id}`;
    console.error(`Error deleting user with ID ${id}:`, errorMessage, error);
    throw new Error(errorMessage);
  }
};

// Update user role
export const updateUserRole = async (id, role) => {
  try {
    const response = await api.patch(`/api/admin/users/${id}/role`, { role }, { withCredentials: true });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || `Failed to update role for user with ID ${id}`;
    console.error(`Error updating role for user with ID ${id}:`, errorMessage, error);
    throw new Error(errorMessage);
  }
};




export const updateAdmin = async (id, userData) => {
  try {
    const response = await api.put(`/api/admin/update/${id}`, userData, { withCredentials: true });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || `Failed to update user with ID ${id}`;
    console.error(`Error updating user with ID ${id}:`, errorMessage, error);
    throw new Error(errorMessage);
  }
};