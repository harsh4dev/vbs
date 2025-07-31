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

  