import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu, Plus, Edit, Trash2, XCircle, CheckCircle, AlertCircle, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { getAllMenus, createMenu, updateMenu, deleteMenu } from '../../services/menuService';
import { getAllPackages } from '../../services/packageService';

// Format price in NPR
const formatNPR = (value) =>
  new Intl.NumberFormat('en-NP', {
    style: 'currency',
    currency: 'NPR',
    minimumFractionDigits: 0,
  }).format(value);

const MenusManagement = () => {
  const [menus, setMenus] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    package_id: '',
    name: '',
    items: [{ name: '', price: '' }],
    free_limit: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Fetch menus and packages
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [menuData, packageData] = await Promise.all([getAllMenus(), getAllPackages()]);
        console.log('Fetched menus:', JSON.stringify(menuData, null, 2));
        menuData.forEach((menu) => {
          console.log(`Menu ${menu.name} (ID: ${menu.id}) items:`, JSON.stringify(menu.items, null, 2));
        });
        console.log('Fetched packages:', JSON.stringify(packageData, null, 2));
        setMenus(Array.isArray(menuData) ? menuData : []);
        setPackages(Array.isArray(packageData.packages) ? packageData.packages : packageData || []);
      } catch (error) {
        console.error('Error fetching data:', error.message);
        setError('Failed to load menus or packages. Please try again.');
        toast.error(error.message);
        setMenus([]);
        setPackages([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // Handle item input changes
  const handleItemChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: field === 'price' ? value.replace(/[^0-9]/g, '') : value } : item
      ),
    }));
    setFormErrors((prev) => ({ ...prev, items: '' }));
  };

  // Add new item
  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { name: '', price: '' }],
    }));
  };

  // Remove item
  const removeItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Menu name is required';
    if (!formData.package_id) {
      errors.package_id = 'Package is required';
    } else if (!packages.find((pkg) => String(pkg.id) === String(formData.package_id))) {
      errors.package_id = 'Invalid package selected';
    }
    if (!formData.free_limit || parseInt(formData.free_limit) <= 0) {
      errors.free_limit = 'Free limit must be a positive number';
    }
    if (formData.items.length === 0) {
      errors.items = 'At least one menu item is required';
    } else {
      let itemErrors = [];
      formData.items.forEach((item, index) => {
        if (!item || typeof item !== 'object') {
          itemErrors.push(`Item ${index + 1} is invalid`);
        } else {
          if (!item.name?.trim()) {
            itemErrors.push(`Item ${index + 1}: Name is required`);
          }
          if (item.price === '' || isNaN(item.price) || parseFloat(item.price) < 0) {
            itemErrors.push(`Item ${index + 1}: Price must be a non-negative number`);
          }
        }
      });
      if (itemErrors.length > 0) {
        errors.items = itemErrors.join('; ');
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form items before validation:', JSON.stringify(formData.items, null, 2));
    if (!validateForm()) {
      toast.error('Please fix form errors before submitting');
      return;
    }

    setLoading(true);
    try {
      const menuData = {
        name: formData.name.trim(),
        items: formData.items.map((item) => ({
          name: item.name.trim(),
          price: parseFloat(item.price) || 0,
        })),
        free_limit: parseInt(formData.free_limit),
      };

      console.log('Submitting menu:', JSON.stringify(menuData, null, 2));

      if (formData.id) {
        if (!menus.find((m) => String(m.id) === String(formData.id))) {
          throw new Error('Menu not found in current list');
        }
        const response = await updateMenu(formData.id, formData.package_id, menuData);
        console.log('Update response:', JSON.stringify(response, null, 2));
        // Fallback: Refetch if response is incomplete
        if (!response.id) {
          console.warn('Incomplete update response, refetching menus');
          const updatedMenus = await getAllMenus();
          setMenus(updatedMenus);
        } else {
          setMenus((prev) =>
            prev.map((menu) =>
              String(menu.id) === String(formData.id)
                ? { ...menu, ...response, package_id: parseInt(formData.package_id) }
                : menu
            )
          );
        }
        toast.success('Menu updated successfully');
      } else {
        const response = await createMenu({ ...menuData, package_id: parseInt(formData.package_id) });
        console.log('Create response:', JSON.stringify(response, null, 2));
        // Fallback: Refetch if response is incomplete
        if (!response.id) {
          console.warn('Incomplete create response, refetching menus');
          const updatedMenus = await getAllMenus();
          setMenus(updatedMenus);
        } else {
          setMenus((prev) => [...prev, response]);
        }
        toast.success('Menu created successfully');
      }

      resetForm();
    } catch (error) {
      console.error('Error saving menu:', error.message);
      const errorMessage = error.message.includes('not found')
        ? 'Menu or package not found. Please refresh and try again.'
        : error.message.includes('referenced by existing bookings')
        ? 'Cannot save menu; it is referenced by existing bookings.'
        : 'Failed to save menu';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle edit menu
  const handleEdit = (menu) => {
    console.log('Editing menu:', JSON.stringify(menu, null, 2));
    const sanitizedItems = Array.isArray(menu.items) && menu.items.length > 0
      ? menu.items.map((item) => ({
          name: typeof item === 'string'
            ? item
            : item.name || item.itemName || item.title || item.item_name || item.dishName || item.description || '',
          price: typeof item === 'string' ? '' : item.price != null ? String(item.price) : '',
        }))
      : [{ name: '', price: '' }];
    setFormData({
      id: String(menu.id),
      package_id: String(menu.package_id),
      name: menu.name || '',
      items: sanitizedItems,
      free_limit: String(menu.free_limit || ''),
    });
    setShowForm(true);
  };

  // Handle delete menu
  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await deleteMenu(id);
      setMenus((prev) => prev.filter((menu) => String(menu.id) !== String(id)));
      setDeleteConfirm(null);
      toast.success('Menu deleted successfully');
    } catch (error) {
      console.error('Error deleting menu:', error.message);
      const errorMessage = error.message.includes('referenced by existing bookings')
        ? 'Cannot delete menu; it is referenced by existing bookings.'
        : 'Failed to delete menu';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      id: null,
      package_id: '',
      name: '',
      items: [{ name: '', price: '' }],
      free_limit: '',
    });
    setFormErrors({});
    setShowForm(false);
  };

  // Handle click outside to close form
  const handleClickOutside = (e) => {
    if (showForm && e.target.className.includes('bg-gray-600')) {
      resetForm();
    }
  };

  if (loading && menus.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 min-h-screen relative" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=20 height=20 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Ccircle cx=2 cy=2 r=1 fill=%22%23e2e8f0%22/%3E%3C/svg%3E")' }} onClick={handleClickOutside}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 flex items-center">
            <Menu className="h-10 w-10 text-indigo-600 mr-3" />
            Menus Management
          </h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg shadow-md hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add New Menu
          </motion.button>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
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
        {menus.length === 0 && !loading && (
          <div className="bg-white rounded-2xl shadow-lg p-10 text-center">
            <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">No Menus Found</h3>
            <p className="text-gray-500 text-lg">Create a new menu to get started.</p>
          </div>
        )}

        {/* Menus Grid */}
        {menus.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {menus.map((menu) => (
              <motion.div
                key={menu.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center mb-3">
                    <Menu className="h-6 w-6 text-indigo-600 mr-2" />
                    {menu.name || 'Unnamed Menu'}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Package: <span className="font-medium">{packages.find((pkg) => String(pkg.id) === String(menu.package_id))?.name || 'Unknown'}</span>
                  </p>
                  <div className="mb-3">
                    <p className="text-sm text-gray-600 font-medium mb-1">Items:</p>
                    {Array.isArray(menu.items) && menu.items.length > 0 ? (
                      <ul className="space-y-1">
                        {menu.items.map((item, index) => (
                          <li key={index} className="flex justify-between items-center text-sm text-gray-700">
                            <span>{typeof item === 'string' ? item : item.name || 'Unnamed Item'}</span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {typeof item === 'string' ? 'N/A' : formatNPR(item.price || 0)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No items</p>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    Free Limit: <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">{menu.free_limit || 'N/A'}</span>
                  </p>
                  <div className="mt-4 flex space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleEdit(menu)}
                      className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
                      title="Edit Menu"
                    >
                      <Edit className="h-5 w-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setDeleteConfirm(menu.id)}
                      className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                      title="Delete Menu"
                    >
                      <Trash2 className="h-5 w-5" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Menu Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-8 relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={resetForm}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="h-7 w-7" />
              </button>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                {formData.id ? 'Edit Menu' : 'Add New Menu'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Menu Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm transition-all duration-300 hover:border-gray-400 ${formErrors.name ? 'border-red-500' : ''}`}
                    placeholder="e.g., Premium Menu"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Package</label>
                  <select
                    name="package_id"
                    value={formData.package_id}
                    onChange={handleInputChange}
                    className={`block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm transition-all duration-300 hover:border-gray-400 ${formErrors.package_id ? 'border-red-500' : ''}`}
                  >
                    <option value="">Select a package</option>
                    {packages.map((pkg) => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.name}
                      </option>
                    ))}
                  </select>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: formErrors.package_id ? 1 : 0 }}
                    className="mt-1 text-sm text-red-500 flex items-center"
                  >
                    {formErrors.package_id && <AlertCircle className="h-4 w-4 mr-1" />}
                    {formErrors.package_id}
                  </motion.p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Menu Items</label>
                  {formData.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-[1fr,120px,40px] gap-3 items-center mt-3">
                      <input
                        type="text"
                        value={item.name || ''}
                        onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                        className="rounded-lg border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm transition-all duration-300 hover:border-gray-400"
                        placeholder="Item name (e.g., Salad)"
                      />
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-sm">₨</span>
                        <input
                          type="text"
                          value={item.price || ''}
                          onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                          className="w-full pl-10 pr-3 text-right rounded-lg border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm transition-all duration-300 hover:border-gray-400"
                          placeholder="Price"
                          pattern="[0-9]*"
                        />
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={() => removeItem(index)}
                        className="p-2 text-red-600 hover:text-red-700 transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </motion.button>
                    </div>
                  ))}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={addItem}
                    className="mt-3 inline-flex items-center px-4 py-1.5 bg-indigo-100 text-indigo-700 font-medium rounded-lg hover:bg-indigo-200 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Item
                  </motion.button>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: formErrors.items ? 1 : 0 }}
                    className="mt-2 text-sm text-red-500 flex items-center"
                  >
                    {formErrors.items && <AlertCircle className="h-4 w-4 mr-1" />}
                    {formErrors.items}
                  </motion.p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Free Limit</label>
                  <input
                    type="number"
                    name="free_limit"
                    value={formData.free_limit}
                    onChange={handleInputChange}
                    className={`block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm transition-all duration-300 hover:border-gray-400 ${formErrors.free_limit ? 'border-red-500' : ''}`}
                    placeholder="e.g., 3"
                    min="0"
                  />
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: formErrors.free_limit ? 1 : 0 }}
                    className="mt-1 text-sm text-red-500 flex items-center"
                  >
                    {formErrors.free_limit && <AlertCircle className="h-4 w-4 mr-1" />}
                    {formErrors.free_limit}
                  </motion.p>
                </div>
                <div className="flex justify-end space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={resetForm}
                    className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg shadow-md hover:from-indigo-700 hover:to-purple-700 disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center transition-all duration-300"
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
                    {loading ? 'Saving...' : formData.id ? 'Update Menu' : 'Create Menu'}
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
                <AlertCircle className="h-7 w-7 text-red-500 mr-2" />
                Confirm Deletion
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to delete this menu? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setDeleteConfirm(null)}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDelete(deleteConfirm)}
                  className="px-5 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 flex items-center transition-colors"
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
                  {loading ? 'Deleting...' : 'Delete Menu'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MenusManagement;