import React, { useState, useEffect } from 'react';
import { Package, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { getAllPackages } from '../../../services/packageService';
import { toast } from 'react-toastify';

// Format price in NPR
const formatNPR = (value) =>
  new Intl.NumberFormat('en-NP', {
    style: 'currency',
    currency: 'NPR',
    minimumFractionDigits: 0,
  }).format(value);

const PackageSelection = ({ packageId, updateBookingData }) => {
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(packageId || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        const data = await getAllPackages();
        setPackages(Array.isArray(data) ? data : data.packages || []);
      } catch (error) {
        setError('Failed to load packages. Please try again.');
        toast.error('Failed to load packages.');
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  const handlePackageSelect = (packageId) => {
    setSelectedPackage(packageId);
    updateBookingData('packageId', packageId);
  };

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

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 min-h-screen" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=20 height=20 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Ccircle cx=2 cy=2 r=1 fill=%22%23e2e8f0%22/%3E%3C/svg%3E")' }}>
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-8 flex items-center">
          <Package className="h-8 w-8 text-indigo-600 mr-3" />
          Select a Package
        </h2>
        <p className="text-gray-600 mb-10 text-lg">
          Choose a package that best suits your event needs.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {packages.map((pkg, index) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`relative bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 ${
                selectedPackage === pkg.id ? 'border-2 border-indigo-500' : 'border border-gray-200 hover:shadow-lg'
              }`}
            >
              {pkg.recommended && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold px-4 py-1.5 rounded-bl-md shadow-sm">
                  Recommended
                </div>
              )}
              <div className="p-8 space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{pkg.name}</h3>
                  {pkg.description && (
                    <p className="text-gray-500 text-sm mt-1">{pkg.description}</p>
                  )}
                </div>
                {Array.isArray(pkg.features) && pkg.features.length > 0 && (
                  <ul className="space-y-2">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <div>
                  <hr className="border-indigo-200 mb-3" />
                  <div className="text-lg font-semibold text-red-600 hover:text-indigo-700  transition-colors">
                    {formatNPR(pkg.base_price)}
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 0 8px rgba(79, 70, 229, 0.3)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePackageSelect(pkg.id)}
                  className={`w-full py-3 rounded-lg font-semibold text-white shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    selectedPackage === pkg.id
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600'
                      : 'bg-indigo-500 hover:bg-indigo-600'
                  }`}
                >
                  {selectedPackage === pkg.id ? 'Selected' : 'Select Package'}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {selectedPackage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-10 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg shadow-md flex items-center"
          >
            <Package className="h-10 w-10 text-indigo-600 mr-4" />
            <div>
              <p className="text-xl font-semibold text-gray-900">
                {packages.find((p) => p.id === selectedPackage)?.name} Selected
              </p>
              <p className="text-gray-600 mt-1">
                Proceed to select menu options for your event.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PackageSelection;