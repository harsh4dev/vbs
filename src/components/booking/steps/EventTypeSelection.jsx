import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { getAllEvents } from '../../../services/eventService';
import { toast } from 'react-toastify';

const EventTypeSelection = ({ event_id, updateBookingData }) => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(event_id || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const data = await getAllEvents();
        setEvents(data);
      } catch (error) {
        setError('Failed to load event types.');
        toast.error('Failed to load event types.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleEventSelect = (eventId) => {
    setSelectedEvent(eventId);
    updateBookingData('event_id', eventId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }




//      
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
      <h2 className="text-2xl font-heading font-semibold text-gray-800 mb-6">Select Event Type</h2>
      <p className="text-gray-600 mb-8">
        Choose the type of event you're planning.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <motion.div
            key={event.id}
            whileHover={{ y: -3 }}
            whileTap={{ y: 1 }}
            onClick={() => handleEventSelect(event.id)}
            className={`p-6 rounded-md border-2 cursor-pointer transition-all ${
              selectedEvent === event.id
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-primary-200 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center">
              <Calendar className={`h-6 w-6 mr-3 ${selectedEvent === event.id ? 'text-primary-600' : 'text-gray-400'}`} />
              <h3 className="text-lg font-medium text-gray-800">{event.name}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {selectedEvent && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 p-5 bg-primary-50 border border-primary-100 rounded-md flex items-center"
        >
          <Calendar className="h-8 w-8 text-primary-500 mr-4" />
          <div>
            <p className="text-lg font-medium text-primary-800">
              {events.find((e) => e.id === selectedEvent)?.name} Selected
            </p>
            <p className="text-primary-600 mt-1">
              Proceed to select guest count.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default EventTypeSelection;