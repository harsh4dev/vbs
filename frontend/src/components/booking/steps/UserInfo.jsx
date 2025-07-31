import React, { useState } from 'react';
import { User, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';

const UserInfo = ({ name, email, otp, otpSent, updateBookingData, sendOtp }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      name: name || '',
      email: email || '',
      otp: otp || '',
    },
  });

  const [localOtpSent, setLocalOtpSent] = useState(otpSent);

  // Watch form values for real-time updates
  const watchedValues = watch();

  // Update booking data when form values change
  React.useEffect(() => {
    if (watchedValues.name) {
      updateBookingData('name', watchedValues.name);
    }
    if (watchedValues.otp) {
      updateBookingData('otp', watchedValues.otp);
    }
  }, [watchedValues.name, watchedValues.otp, updateBookingData]);

  const onSendOtp = async () => {
    try {
      await sendOtp();
      setLocalOtpSent(true);
    } catch (error) {
      console.error('Error sending OTP:', error);
    }
  };

  const onSubmit = (data) => {
    updateBookingData('name', data.name);
    updateBookingData('email', data.email);
    updateBookingData('otp', data.otp);
    // Submission is handled by BookingWizard's nextStep
  };

  return (
    <div>
      <h2 className="text-2xl font-heading font-semibold text-gray-800 mb-6">Your Information</h2>
      <p className="text-gray-600 mb-8">
        Please verify your details. We'll send a verification code to your email.
      </p>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-6">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="name"
                type="text"
                {...register('name', {
                  required: 'Name is required',
                  minLength: {
                    value: 2,
                    message: 'Name should be at least 2 characters',
                  },
                })}
                className={`pl-10 w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.name
                    ? 'border-error-300 focus:border-error-500 focus:ring-error-200'
                    : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
                }`}
                placeholder="Enter your full name"
              />
            </div>
            {errors.name && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1 text-sm text-error-600"
              >
                {errors.name.message}
              </motion.p>
            )}
          </div>

          {/* Email Field (Disabled) */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                disabled
                className="pl-10 w-full p-3 border rounded-lg bg-gray-100"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              We'll send a verification code to this email
            </p>
          </div>

          {/* OTP Button */}
          <div>
            <button
              type="button"
              onClick={onSendOtp}
              disabled={localOtpSent}
              className={`px-6 py-3 rounded-md ${
                localOtpSent
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              }`}
            >
              {localOtpSent ? 'OTP Sent' : 'Send OTP'}
            </button>
          </div>

          {/* OTP Field (Shown after OTP sent) */}
          {localOtpSent && (
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                OTP
              </label>
              <input
                id="otp"
                type="text"
                {...register('otp', {
                  required: 'OTP is required',
                  pattern: {
                    value: /^[0-9]{6}$/,
                    message: 'Please enter a valid 6-digit OTP',
                  },
                })}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.otp
                    ? 'border-error-300 focus:border-error-500 focus:ring-error-200'
                    : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
                }`}
                placeholder="Enter 6-digit OTP"
              />
              {errors.otp && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-sm text-error-600"
                >
                  {errors.otp.message}
                </motion.p>
              )}
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default UserInfo;