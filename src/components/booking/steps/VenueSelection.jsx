import React, { useState, useEffect } from 'react';
import { MapPin, Check, Search } from 'lucide-react'; // Import Search icon
import { motion } from 'framer-motion';
import { getAllVenues } from '../../../services/venueService';
import { toast } from 'react-toastify';

const VenueSelection = ({
  venueId,
  guestCount,
  updateBookingData,
  isAvailable,
  checkAvailability,
  isCheckingAvailability
}) => {
  const [venues, setVenues] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState(venueId || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(''); // New state for search term

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        setLoading(true);
        const res = await getAllVenues(guestCount);
        // console.log('Raw venue data:', res);

        const data = res?.venues;
        if (!Array.isArray(data)) {
          throw new Error('Invalid venues data received');
        }

        setVenues(data);
      } catch (error) {
        console.error('Error fetching venues:', error);
        setError('Failed to load venues.');
        toast.error('Failed to load venues.');
      } finally {
        setLoading(false);
      }
    };

    fetchVenues();
  }, [guestCount]);

  const handleVenueSelect = (venueId) => {
    setSelectedVenue(venueId);
    updateBookingData('venueId', venueId);
  };

  // New handler for search input change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Filter venues based on search term
  const filteredVenues = venues.filter((venue) =>
    venue.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div className="flex justify-between items-center mb-6"> {/* Flex container for title and search */}
        <h2 className="text-2xl font-heading font-semibold text-gray-800">Select a Venue</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search venues..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        </div>
      </div>
      <p className="text-gray-600 mb-8">Choose a venue that suits your event needs.</p>

      {filteredVenues.length === 0 && (
        <p className="text-gray-500 text-center py-10">No venues found matching your search.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredVenues.map((venue) => ( // Use filteredVenues here
          <motion.div
            key={venue.id}
            whileHover={{ y: -3 }}
            whileTap={{ y: 1 }}
            className={`rounded-md border-2 overflow-hidden transition-all ${
              selectedVenue === venue.id ? 'border-primary-500' : 'border-gray-200 hover:border-primary-200'
            }`}
            onClick={() => handleVenueSelect(venue.id)}
          >
            <img
              src={`${venue.image.replace(/\\/g, '/')}`}
              alt={venue.name}
              className="w-full h-48 object-cover"
              onError={(e) => {
                e.target.src = './default_venue.jpg';
              }}
            />
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">{venue.name}</h3>
                  <p className="text-gray-500 text-sm mt-1">Capacity: {venue.capacity} guests</p>
                </div>
                {selectedVenue === venue.id && <Check className="h-6 w-6 text-primary-600" />}
              </div>
              <div className="flex items-center text-gray-600">
                {/* <MapPin className="h-5 w-5 text-primary-500 mr-2" /> */}
                {/* <span>Venue Location</span> */}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {selectedVenue && (
        <div className="mt-8 p-5 bg-primary-50 border border-primary-100 rounded-md flex items-start">
          <MapPin className="h-8 w-8 text-primary-500 mr-4 flex-shrink-0 mt-1" />
          <div>
            <p className="text-lg font-medium text-primary-800">
              {venues.find((v) => v.id === selectedVenue)?.name} Selected
            </p>
            <p className="text-primary-600 mt-1">Please check availability in the next step.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VenueSelection;