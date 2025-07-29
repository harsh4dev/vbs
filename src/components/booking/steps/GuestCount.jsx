import React, { useState, useEffect } from 'react';
import { Plus, Minus, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { getAllVenues } from '../../../services/venueService';
import { toast } from 'react-toastify';

const GuestCount = ({ guestCount, updateBookingData }) => {
  const [minGuests, setMinGuests] = useState(10);
  const [maxGuests, setMaxGuests] = useState(500);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVenueCapacities = async () => {
      try {
        setLoading(true);
        const { venues } = await getAllVenues();
        if (venues.length > 0) {
          const capacities = venues.map((venue) => venue.capacity);
          setMinGuests(Math.min(...capacities, 10));
          setMaxGuests(Math.max(...capacities, 500));
        } else {
          toast.warn('No venues available.');
        }
      } catch (error) {
        setError('Failed to load venue capacities.');
        toast.error('Failed to load venue capacities.');
      } finally {
        setLoading(false);
      }
    };
    fetchVenueCapacities();
  }, []);

  const handleIncrement = () => {
    updateBookingData('guestCount', Math.min(guestCount + 10, maxGuests));
  };

  const handleDecrement = () => {
    updateBookingData('guestCount', Math.max(guestCount - 10, minGuests));
  };

  const handleInputChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= minGuests && value <= maxGuests) {
      updateBookingData('guestCount', value);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-heading font-semibold text-gray-800 mb-6">Guest Count</h2>
      <p className="text-gray-600 mb-8">
        Indicate how many guests you expect for your event.
      </p>

      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center mb-8 w-full max-w-md">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleDecrement}
            disabled={guestCount <= minGuests}
            className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${
              guestCount <= minGuests ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-primary-100 text-primary-600 hover:bg-primary-200'
            }`}
          >
            <Minus className="h-5 w-5" />
          </motion.button>

          <div className="mx-6">
            <input
              type="number"
              value={guestCount}
              onChange={handleInputChange}
              min={minGuests}
              max={maxGuests}
              className="w-24 h-16 text-center text-4xl font-semibold text-gray-800 border-b-2 border-primary-300 focus:border-primary-500 focus:outline-none"
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleIncrement}
            disabled={guestCount >= maxGuests}
            className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${
              guestCount >= maxGuests ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-primary-100 text-primary-600 hover:bg-primary-200'
            }`}
          >
            <Plus className="h-5 w-5" />
          </motion.button>
        </div>

        <div className="w-full max-w-md">
          <div className="bg-gray-100 h-2 rounded-full w-full mt-4">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((guestCount - minGuests) / (maxGuests - minGuests)) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>{minGuests}</span>
            <span>{maxGuests}</span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 p-5 bg-primary-50 border border-primary-100 rounded-md flex items-center"
        >
          <Users className="h-8 w-8 text-primary-500 mr-4" />
          <div>
            <p className="text-lg font-medium text-primary-800">{guestCount} Guests Selected</p>
            <p className="text-primary-600 mt-1">
              Proceed to select a venue.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default GuestCount;