import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import DateSelection from './steps/DateSelection';
import EventTypeSelection from './steps/EventTypeSelection';
import GuestCount from './steps/GuestCount';
import VenueSelection from './steps/VenueSelection';
import ShiftSelection from './steps/ShiftSelection';
import PackageSelection from './steps/PackageSelection';
import MenuSelection from './steps/MenuSelection';
import FareSummary from './steps/FareSummary';
import OtpVerification from './steps/OtpVerification';
import BookingConfirmation from './steps/BookingConfirmation';
import api from '../../services/api';
import { showToast } from '../../utils/toastUtils';
import { CheckCircle } from 'lucide-react';

const steps = [
  {
    id: 'event-details',
    title: 'Event Details',
    components: [DateSelection, EventTypeSelection, GuestCount, VenueSelection, ShiftSelection],
  },
  {
    id: 'package-menu',
    title: 'Package & Menu',
    components: [PackageSelection, MenuSelection],
  },
  {
    id: 'fare',
    title: 'Fare Summary',
    components: [FareSummary],
  },
  {
    id: 'verification-confirmation',
    title: 'Verification & Confirmation',
    components: [OtpVerification, BookingConfirmation],
  },
];

const BookingWizard = () => {
  const navigate = useNavigate();
  const { user, sendOtp, verifyOtp, sendConfirmation } = useAuth();

  // Memoize components
  const MemoizedComponents = useMemo(
    () =>
      steps.reduce((acc, step) => {
        step.components.forEach((Component) => {
          acc[Component.name] = memo(Component);
        });
        return acc;
      }, {}),
    []
  );

  const getInitialUserData = useCallback(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (!parsedUser.id || !parsedUser.email || !parsedUser.name || !parsedUser.phone) {
          throw new Error('Invalid user data in localStorage');
        }
        return {
          id: parsedUser.id || null,
          name: parsedUser.name || '',
          email: parsedUser.email || '',
          phone: parsedUser.phone || '',
        };
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
        return { id: null, name: '', email: '', phone: '' };
      }
    }
    return { id: null, name: '', email: '', phone: '' };
  }, []);

  const initialUserData = useMemo(() => getInitialUserData(), [getInitialUserData]);

  const [currentStep, setCurrentStep] = useState(0);
  const [bookingData, setBookingData] = useState({
    date: null,
    event_id: null,
    guestCount: 50,
    venueId: null,
    shiftId: null,
    packageId: null,
    menuId: null,
    selectedMenus: {},
    baseFare: 0,
    extraCharges: 0,
    totalFare: 0,
    name: user?.name || initialUserData.name,
    email: user?.email || initialUserData.email,
    phone: user?.phone || initialUserData.phone,
  });
  const [isAvailable, setIsAvailable] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Memoize bookingData
  const memoizedBookingData = useMemo(() => ({ ...bookingData }), [JSON.stringify(bookingData)]);

  // Sync bookingData with user changes
  useEffect(() => {
    if (user) {
      setBookingData((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
    } else {
      setBookingData((prev) => ({
        ...prev,
        name: initialUserData.name,
        email: initialUserData.email,
        phone: initialUserData.phone,
      }));
    }
  }, [user, initialUserData]);

  // Check if current step is complete
  const isStepComplete = useCallback(() => {
    const stepId = steps[currentStep].id;
    if (stepId === 'event-details') {
      return (
        bookingData.date &&
        bookingData.event_id &&
        bookingData.guestCount &&
        bookingData.shiftId &&
        bookingData.venueId &&
        isAvailable
      );
    }
    if (stepId === 'package-menu') {
      return bookingData.packageId && Object.keys(bookingData.selectedMenus).length > 0;
    }
    if (stepId === 'fare') {
      return (
        bookingData.baseFare > 0 &&
        Number.isFinite(bookingData.extraCharges) &&
        bookingData.totalFare > 0
      );
    }
    if (stepId === 'verification-confirmation') {
      return isComplete;
    }
    return false;
  }, [currentStep, bookingData, isAvailable, isComplete]);

  const updateBookingData = useCallback((key, value) => {
    setBookingData((prev) => {
      const newData = { ...prev, [key]: value };
      if (key === 'venueId' || key === 'shiftId') {
        setIsAvailable(false);
      }
      if (['packageId', 'selectedMenus', 'guestCount'].includes(key)) {
        return { ...newData, baseFare: 0, extraCharges: 0, totalFare: 0 };
      }
      return newData;
    });
  }, []);

  const checkAvailability = useCallback(async () => {
    const { date, venueId, shiftId, event_id, guestCount } = bookingData;
    if (!date || !venueId || !shiftId || !event_id || !guestCount) {
      showToast('Please select all required fields.', { type: 'error' });
      return;
    }
    setIsCheckingAvailability(true);
    try {
      const formattedDate = date.toISOString().split('T')[0];
      await api.post('/api/admin/bookings/check-availability', {
        event_id,
        venue_id: venueId,
        shift_id: shiftId,
        event_date: formattedDate,
        guest_count: guestCount,
      });
      setIsAvailable(true);
      showToast('Slot is available!', { type: 'success' });
    } catch (error) {
      showToast(error.response?.data?.message || 'Selected slot is not available.', {
        type: 'error',
      });
      throw error;
    } finally {
      setIsCheckingAvailability(false);
    }
  }, [bookingData]);

  const calculateFare = useCallback(async () => {
    const { packageId, selectedMenus, guestCount } = bookingData;
    if (!packageId || !guestCount) {
      showToast('Please select a package and guest count.', { type: 'error' });
      return;
    }
    setIsCalculating(true);
    try {
      const response = await api.post('/api/admin/bookings/calculate-fare', {
        package_id: packageId,
        selected_menus: selectedMenus,
        guest_count: guestCount,
      });
      const { base_fare, extra_charges = 0, total_fare } = response.data;
      setBookingData((prev) => ({
        ...prev,
        baseFare: base_fare,
        extraCharges: extra_charges,
        totalFare: total_fare,
      }));
      if (extra_charges === 0) {
        console.warn('calculateFare returned extra_charges: 0');
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to calculate fare.', { type: 'error' });
      throw error;
    } finally {
      setIsCalculating(false);
    }
  }, [bookingData]);

  const handleVerifyOtp = useCallback(
    async (otp) => {
      setSubmitting(true);
      try {
        await verifyOtp(otp);
        const requiredFields = [
          'date',
          'event_id',
          'venueId',
          'shiftId',
          'packageId',
          'menuId',
          'guestCount',
          'name',
          'email',
          'phone',
          'baseFare',
          'totalFare',
        ];
        const missingFields = requiredFields.filter(
          (field) => !bookingData[field] || bookingData[field] === null
        );
        if (missingFields.length > 0) {
          throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }
        if (!Number.isFinite(bookingData.extraCharges)) {
          console.warn('extraCharges is invalid, recalculating fare');
          await calculateFare();
        }
        if (!user?.id) {
          throw new Error('User ID not found. Please log in again.');
        }
        let selectedMenus = bookingData.selectedMenus;
        const menuId = bookingData.menuId;
        if (!menuId) {
          throw new Error('No menu ID selected. Please select a menu.');
        }
        if (!selectedMenus || (typeof selectedMenus === 'object' && Object.keys(selectedMenus).length === 0)) {
          selectedMenus = { [menuId]: [] };
          console.warn(`selected_menus is empty; setting to { ${menuId}: [] }`);
        } else if (Array.isArray(selectedMenus)) {
          console.warn(`selected_menus is an array; converting to { ${menuId}: [...] }`);
          selectedMenus = { [menuId]: selectedMenus };
        } else if (Object.values(selectedMenus).some((menu) => !Array.isArray(menu))) {
          console.warn(`selected_menus has invalid values; converting to { ${menuId}: [...] }`);
          selectedMenus = { [menuId]: Object.values(selectedMenus).flat() };
        } else if (!selectedMenus[menuId]) {
          console.warn(`selected_menus missing menuId ${menuId}; restructuring`);
          selectedMenus = { [menuId]: Object.values(selectedMenus).flat() };
        }

        const payload = {
          user_id: user.id,
          event_id: bookingData.event_id,
          venue_id: bookingData.venueId,
          shift_id: bookingData.shiftId,
          package_id: bookingData.packageId,
          guest_count: Number(bookingData.guestCount),
          event_date: bookingData.date.toISOString().split('T')[0],
          selected_menus: selectedMenus,
          customer_phone: bookingData.phone.startsWith('+977') ? bookingData.phone : `+977${bookingData.phone}`,
          base_fare: Number(bookingData.baseFare),
          extra_charges: Number(bookingData.extraCharges || 0),
          total_fare: Number(bookingData.totalFare),
        };
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const token = storedUser.token;
        const response = await api.post('/api/admin/bookings/store', payload, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        setBookingId(response.data.bookingId);
        await sendConfirmation(response.data.bookingId, bookingData.email, bookingData.phone);
        setIsComplete(true);
        showToast('Booking confirmed successfully!', { type: 'success' });
      } catch (error) {
        console.error('Booking error:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        const errorMessage =
          error.response?.data?.errors?.map((err) => err.msg).join(', ') ||
          error.response?.data?.message ||
          error.message ||
          'Failed to store booking. Please check your input and try again.';
        showToast(errorMessage, { type: 'error' });
        throw error;
      } finally {
        setSubmitting(false);
      }
    },
    [verifyOtp, user, bookingData, sendConfirmation, calculateFare]
  );

  const sendOtpCallback = useCallback(
    async () => {
      const email = memoizedBookingData.email;
      const phone = memoizedBookingData.phone;
      if (!email || !phone) {
        showToast('Email and phone number are required.', { type: 'error' });
        throw new Error('Email and phone number are required');
      }
      return await sendOtp(email, phone);
    },
    [sendOtp, memoizedBookingData.email, memoizedBookingData.phone]
  );

  const handleNext = useCallback(() => {
    if (!isStepComplete()) {
      showToast('Please complete all required fields.', { type: 'error' });
      return;
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep, isStepComplete]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/');
    }
  }, [currentStep, navigate]);

  return (
    <div className="w-full max-w-full sm:max-w-3xl lg:max-w-4xl mx-auto py-8 sm:py-12 px-4 sm:px-8 lg:px-12">
      <h1 className="text-2xl sm:text-3xl font-heading font-bold text-gray-900 mb-8 sm:mb-10 text-center">
        Plan Your Event
      </h1>

      <div className="mb-8 sm:mb-12">
        <div className="flex flex-wrap justify-between items-center gap-2 sm:gap-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex-1 min-w-[80px] text-center">
              <div
                className={`mx-auto w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                  index <= currentStep ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}
              >
                {index + 1}
              </div>
              <p
                className={`mt-2 text-xs sm:text-sm font-medium ${
                  index <= currentStep ? 'text-primary-600' : 'text-gray-500'
                }`}
              >
                {step.title}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-3 sm:mt-4 relative">
          <div className="absolute top-1/2 w-full h-1 bg-gray-200 transform -translate-y-1/2"></div>
          <div
            className="absolute top-1/2 h-1 bg-primary-600 transition-all duration-300 transform -translate-y-1/2"
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          ></div>
        </div>
      </div>

      <motion.div
        key={`step-${currentStep}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-xl shadow-lg p-6 sm:p-8"
      >
        {steps[currentStep].id === 'event-details' && (
          <div className="flex flex-col gap-6 sm:gap-8">
            {steps[currentStep].components.map((Component) => {
              const ComponentMemo = MemoizedComponents[Component.name];
              return (
                <motion.div
                  key={Component.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="relative bg-gray-50 p-6 sm:p-8 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <ComponentMemo
                    date={memoizedBookingData.date}
                    event_id={memoizedBookingData.event_id}
                    guestCount={memoizedBookingData.guestCount}
                    venueId={memoizedBookingData.venueId}
                    shiftId={memoizedBookingData.shiftId}
                    updateBookingData={updateBookingData}
                    isAvailable={isAvailable}
                    checkAvailability={checkAvailability}
                    isCheckingAvailability={isCheckingAvailability}
                  />
                  {Component.name === 'DateSelection' && bookingData.date && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-4 right-4"
                    >
                      <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
                    </motion.div>
                  )}
                  {Component.name === 'EventTypeSelection' && bookingData.event_id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-4 right-4"
                    >
                      <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
                    </motion.div>
                  )}
                  {Component.name === 'GuestCount' && bookingData.guestCount && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-4 right-4"
                    >
                      <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
                    </motion.div>
                  )}
                  {Component.name === 'VenueSelection' && bookingData.venueId && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-4 right-4"
                    >
                      <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
                    </motion.div>
                  )}
                  {Component.name === 'ShiftSelection' && bookingData.shiftId && isAvailable && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-4 right-4"
                    >
                      <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
        {steps[currentStep].id === 'package-menu' && (
          <div className="flex flex-col gap-6 sm:gap-8">
            {steps[currentStep].components.map((Component) => {
              const ComponentMemo = MemoizedComponents[Component.name];
              return (
                <motion.div
                  key={Component.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="relative bg-gray-50 p-6 sm:p-8 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <ComponentMemo
                    packageId={memoizedBookingData.packageId}
                    selectedMenus={memoizedBookingData.selectedMenus}
                    updateBookingData={updateBookingData}
                  />
                  {Component.name === 'PackageSelection' && bookingData.packageId && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-4 right-4"
                    >
                      <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
                    </motion.div>
                  )}
                  {Component.name === 'MenuSelection' && Object.keys(bookingData.selectedMenus).length > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-4 right-4"
                    >
                      <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
        {steps[currentStep].id === 'fare' && (
          <div>
            {steps[currentStep].components.map((Component) => {
              const ComponentMemo = MemoizedComponents[Component.name];
              return (
                <ComponentMemo
                  key={Component.name}
                  baseFare={memoizedBookingData.baseFare}
                  extraCharges={memoizedBookingData.extraCharges}
                  totalFare={memoizedBookingData.totalFare}
                  calculateFare={calculateFare}
                  isCalculating={isCalculating}
                />
              );
            })}
          </div>
        )}
        {steps[currentStep].id === 'verification-confirmation' && (
          <div>
            {isComplete ? (
              (() => {
                const ConfirmationComponent = MemoizedComponents[BookingConfirmation.name];
                return (
                  <ConfirmationComponent
                    bookingId={bookingId}
                    date={memoizedBookingData.date}
                    guestCount={memoizedBookingData.guestCount}
                    totalFare={memoizedBookingData.totalFare}
                    email={memoizedBookingData.email}
                  />
                );
              })()
            ) : (
              (() => {
                const OtpComponent = MemoizedComponents[OtpVerification.name];
                return (
                  <OtpComponent
                    email={memoizedBookingData.email}
                    phone={memoizedBookingData.phone}
                    verifyOtp={handleVerifyOtp}
                    submitting={submitting}
                    updateBookingData={updateBookingData}
                    sendOtp={sendOtpCallback}
                    bookingData={memoizedBookingData}
                  />
                );
              })()
            )}
          </div>
        )}
      </motion.div>

      {currentStep < steps.length - 1 && (
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row justify-between gap-4 sm:gap-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBack}
            className="w-full sm:w-auto px-6 py-3 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors font-medium text-base"
          >
            Back
          </motion.button>
          {isStepComplete() && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNext}
              className="w-full sm:w-auto px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors font-medium text-base"
            >
              Next
            </motion.button>
          )}
        </div>
      )}
    </div>
  );
};

export default memo(BookingWizard);