import React from 'react';
import { CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const BookingConfirmation = ({ bookingId, date, guestCount, totalFare, email }) => {
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-heading font-semibold text-gray-800 mb-6">Booking Confirmed!</h2>
      <p className="text-gray-600 mb-8">
        Your event booking has been successfully confirmed. We've sent a confirmation email to {email}.
      </p>

      <div className="bg-gray-50 p-6 rounded-md border border-gray-200">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Booking Details</h3>
        <div className="space-y-4">
          <div className="flex justify-between text-gray-600">
            <span>Booking ID</span>
            <span>{bookingId}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Date</span>
            <span>{date?.toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Guest Count</span>
            <span>{guestCount}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Total Cost</span>
            <span>NPR {totalFare.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 p-5 bg-primary-50 border border-primary-100 rounded-md flex items-start"
      >
        <CheckCircle className="h-8 w-8 text-primary-500 mr-4 flex-shrink-0 mt-1" />
        <div>
          <p className="text-lg font-medium text-primary-800">Thank You!</p>
          <p className="text-primary-600 mt-1">
            Your event is booked. You'll receive a confirmation email soon.
          </p>
        </div>
      </motion.div>

      <div className="mt-8 flex justify-center">
        <button
          onClick={handleBackToHome}
          className="px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default BookingConfirmation;