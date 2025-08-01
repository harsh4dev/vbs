import React, { useState, useEffect } from 'react';
import { Utensils, PlusCircle, MinusCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { getMenusByPackageId } from '../../../services/menuService';
import { toast } from 'react-toastify';

// Format price in NPR
const formatNPR = (value) =>
  new Intl.NumberFormat('en-NP', {
    style: 'currency',
    currency: 'NPR',
    minimumFractionDigits: 0,
  }).format(value);

const MenuSelection = ({ packageId, selectedMenus, updateBookingData }) => {
  const [menus, setMenus] = useState([]);
  const [activeMenu, setActiveMenu] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMenus = async () => {
      if (!packageId) {
        // console.log('No packageId provided, skipping menu fetch.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // console.log(`Fetching menus for packageId: ${packageId}`);
        const data = await getMenusByPackageId(packageId);
        console.log('Menu data received:', data);

        if (!Array.isArray(data)) {
          throw new Error('Invalid menu data format: Expected an array');
        }

        // Validate menu objects
        const validatedMenus = data.map((menu) => ({
          id: menu.id || null,
          name: menu.name || 'Unnamed Menu',
          free_limit: menu.free_limit || 0,
          items: Array.isArray(menu.items)
            ? menu.items.map((item) => ({
                name: item.name || 'Unnamed Item',
                price: Number(item.price) || 0,
              }))
            : [],
        }));

        if (validatedMenus.length === 0) {
          setError('No menus available for this package.');
          toast.warn('No menus available for this package.');
        } else {
          setMenus(validatedMenus);
          const firstMenuId = validatedMenus[0]?.id || null;
          setActiveMenu(firstMenuId);
          // Set initial menuId in bookingData
          if (firstMenuId) {
            updateBookingData('menuId', firstMenuId);
            // Initialize selectedMenus for the first menu if empty
            if (!selectedMenus[firstMenuId]) {
              updateBookingData('selectedMenus', { ...selectedMenus, [firstMenuId]: [] });
            }
          }
        }
      } catch (error) {
        const errorMessage = error.message || 'Failed to load menus.';
        console.error('Error fetching menus:', errorMessage, error);
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchMenus();
  }, [packageId, updateBookingData]);

  const handleMenuSelect = (menuId) => {
    if (!menuId) {
      console.warn('No menuId provided for selection');
      return;
    }
    setActiveMenu(menuId);
    updateBookingData('menuId', menuId);
    // Ensure selectedMenus has an entry for the menu
    if (!selectedMenus[menuId]) {
      updateBookingData('selectedMenus', { ...selectedMenus, [menuId]: [] });
    }
  };

  const handleMenuItemToggle = (menuId, itemName) => {

    if (!menuId || !itemName) {
      console.warn('Invalid menuId or itemName:', { menuId, itemName });
      return;
    }
    const currentMenuItems = selectedMenus[menuId] || [];
    const updatedMenuItems = currentMenuItems.includes(itemName)
      ? currentMenuItems.filter((name) => name !== itemName)
      : [...currentMenuItems, itemName];

    const updatedSelectedMenus = {
      ...selectedMenus,
      [menuId]: updatedMenuItems,
    };

    // console.log('Updated selectedMenus:', updatedSelectedMenus);
    updateBookingData('selectedMenus', updatedSelectedMenus);
    updateBookingData('menuId', menuId); // Ensure menuId is set
  };

  const getSelectedItemsCount = (menuId) => selectedMenus[menuId]?.length || 0;

  const isItemSelected = (menuId, itemName) =>
    selectedMenus[menuId]?.includes(itemName) || false;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center">
        <p className="text-red-500 mb-4 text-lg font-medium">{error}</p>
        <button
          className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (menus.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-600 mb-4 text-lg">No menus available for the selected package.</p>
        <button
          className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  console.log('Rendering menus:', menus);

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 min-h-screen" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=20 height=20 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Ccircle cx=2 cy=2 r=1 fill=%22%23e2e8f0%22/%3E%3C/svg%3E")' }}>
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-8 flex items-center">
          <Utensils className="h-8 w-8 text-indigo-600 mr-3" />
          Select Menu Options
        </h2>
        <p className="text-gray-600 mb-10 text-lg">
          Customize your event menu by selecting items.
        </p>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left - Menu Categories */}
          <div className="w-full lg:w-1/3">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Menu Categories</h3>
            <div className="space-y-3">
              {menus.map((menu, index) => (
                <motion.button
                  key={menu.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, boxShadow: '0 0 8px rgba(79, 70, 229, 0.3)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleMenuSelect(menu.id)}
                  className={`w-full text-left px-5 py-3 rounded-lg shadow-sm transition-all duration-300 ${
                    activeMenu === menu.id
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-indigo-100 hover:text-indigo-600'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span>{menu.name}</span>
                    <span className="text-sm">
                      ({getSelectedItemsCount(menu.id)}/{menu.free_limit || 0})
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Right - Menu Items */}
          <div className="w-full lg:w-2/3">
            {activeMenu && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {menus.find((m) => m.id === activeMenu)?.name || 'Menu'} Options
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Select up to {menus.find((m) => m.id === activeMenu)?.free_limit || 0} items at no extra charge.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(menus.find((m) => m.id === activeMenu)?.items || []).map((item, index) => (
                    <motion.div
                      key={item.name || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      whileHover={{ y: -5, scale: 1.02, shadow: '0 0 8px rgba(0, 0, 0, 0.1)' }}
                      className={`p-4 border rounded-lg shadow-md flex flex-col justify-between transition-all duration-300 min-h-[120px] ${
                        isItemSelected(activeMenu, item.name)
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-indigo-200 hover:shadow-lg'
                      }`}
                    >
                      <div>
                        <h4 className="text-base font-semibold text-gray-900">{item.name || 'Unnamed Item'}</h4>
                        <p className="mt-1.5 text-indigo-600 text-xs bg-gradient-to-r from-indigo-100 to-purple-100 px-1.5 py-0.5 rounded-full inline-block">
                          {formatNPR(item.price)}
                        </p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleMenuItemToggle(activeMenu, item.name)}
                        className={`mt-2 p-2 rounded-full transition-all duration-300 self-end ${
                          isItemSelected(activeMenu, item.name)
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                            : 'bg-gray-200 text-gray-600 hover:bg-indigo-200 hover:text-indigo-600'
                        }`}
                      >
                        {isItemSelected(activeMenu, item.name) ? (
                          <MinusCircle className="h-5 w-5" />
                        ) : (
                          <PlusCircle className="h-5 w-5" />
                        )}
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Summary */}
        {Object.keys(selectedMenus).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-10 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg shadow-md flex items-center"
          >
            <Utensils className="h-10 w-10 text-indigo-600 mr-4" />
            <div>
              <p className="text-xl font-semibold text-gray-900">Menu Items Selected</p>
              <p className="text-gray-600 mt-1">
                Proceed to review fare summary.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MenuSelection;