import api from './api';

// Fetch all menus
export const getAllMenus = async () => {
  try {
    const response = await api.get('/api/admin/menu');
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to fetch menus';
    console.error('Error fetching menus:', errorMessage, error);
    throw new Error(errorMessage);
  }
};

// Fetch menus by package ID
export const getMenusByPackageId = async (packageId) => {
  try {
    const response = await api.get(`/api/admin/menus/package/${packageId}`, { withCredentials: true });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || `Failed to fetch menus for package ID ${packageId}`;
    console.error(`Error fetching menus for package ID ${packageId}:`, errorMessage, error);
    throw new Error(errorMessage);
  }
};

// Fetch a single menu by ID
export const getMenuById = async (id) => {
  try {
    const response = await api.get(`/api/admin/menus/${id}`, { withCredentials: true });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || `Failed to fetch menu with ID ${id}`;
    console.error(`Error fetching menu with ID ${id}:`, errorMessage, error);
    throw new Error(errorMessage);
  }
};

// Create a new menu
export const createMenu = async (menuData) => {
  try {
    const response = await api.post('/api/admin/menu/create', menuData, { withCredentials: true });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to create menu';
    console.error('Error creating menu:', errorMessage, error);
    throw new Error(errorMessage);
  }
};

// Update a menu
export const updateMenu = async (id, package_id, menuData) => {
  try {
    const response = await api.put(`/api/admin/menu/${package_id}/${id}`, menuData, { withCredentials: true });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || `Failed to update menu with ID ${id}`;
    console.error(`Error updating menu with ID ${id}:`, errorMessage, error);
    throw new Error(errorMessage);
  }
};

// Delete a menu
export const deleteMenu = async (id) => {
  try {
    const response = await api.delete(`/api/admin/menu/delete/${id}`, { withCredentials: true });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || `Failed to delete menu with ID ${id}`;
    console.error(`Error deleting menu with ID ${id}:`, errorMessage, error);
    throw new Error(errorMessage);
  }
};