import React, { useEffect } from 'react';
import { DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

const FareSummary = ({ baseFare, extraCharges, totalFare, calculateFare, isCalculating }) => {
  useEffect(() => {
    const fetchFare = async () => {
      if (totalFare !== 0) {
        console.log('Fare already calculated, skipping fetch:', { baseFare, extraCharges, totalFare });
        return;
      }
      try {
        console.log('Fetching fare...');
        await calculateFare();
        console.log('Fare calculated successfully:', { baseFare, extraCharges, totalFare });
      } catch (error) {
        console.error('Error calculating fare in FareSummary:', error);
        toast.error('Failed to calculate fare.');
      }
    };
    fetchFare();
  }, [calculateFare, totalFare]);

  if (isCalculating) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-heading font-semibold text-gray-800 mb-6">Fare Summary</h2>
      <p className="text-gray-600 mb-8">
        Review the estimated cost for your event.
      </p>

      <div className="bg-gray-50 p-6 rounded-md border border-gray-200">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Cost Breakdown</h3>
        <div className="space-y-4">
          <div className="flex justify-between text-gray-600">
            <span>Base Package Price</span>
            <span>NPR {baseFare.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Additional Menu Items</span>
            <span>NPR {extraCharges.toLocaleString()}</span>
          </div>
          <div className="border-t border-gray-200 pt-4 flex justify-between font-semibold text-gray-800">
            <span>Total Estimated Cost</span>
            <span>NPR {totalFare.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 p-5 bg-primary-50 border border-primary-100 rounded-md flex items-start"
      >
        <DollarSign className="h-8 w-8 text-primary-500 mr-4 flex-shrink-0 mt-1" />
        <div>
          <p className="text-lg font-medium text-primary-800">Fare Summary</p>
          <p className="text-primary-600 mt-1">
            Your total estimated cost is NPR {totalFare.toLocaleString()}.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default FareSummary;