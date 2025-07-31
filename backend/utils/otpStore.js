const otpStore = new Map();

const storeOTP = (userId, otp) => {
  otpStore.set(userId, { otp, expires: Date.now() + 10 * 60 * 1000 }); // 10 minutes
};

const verifyOTP = (userId, otp) => {
  const record = otpStore.get(userId);
  if (!record || record.expires < Date.now()) {
    return false;
  }
  return record.otp === parseInt(otp);
};

const clearOTP = (userId) => {
  otpStore.delete(userId);
};

module.exports = { storeOTP, verifyOTP, clearOTP };