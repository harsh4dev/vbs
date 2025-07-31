const axios = require('axios');

const smsClient = axios.create({
  baseURL: 'https://sms.aakashsms.com/sms/v3/send/',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
});

module.exports = async function sendSMS({ to, text }) {
  try {
    await smsClient.post('', {
      auth_token: process.env.SMS_AUTH_TOKEN,
      to,
      text,
    });
    console.log('✅ SMS sent to:', to);
    return true;
  } catch (error) {
    console.error('❌ SMS error:', error.response ? error.response.data : error.message);
    return false;
  }
};