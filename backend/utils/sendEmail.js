const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE, // e.g., 'Gmail'
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

module.exports = async function sendEmail({ to, subject, html }) {
    try {
        await transporter.sendMail({
            from: `"EventEase" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html, // Use HTML if provided
        });
        console.log('✅ Email sent to:', to);
        return true;
    } catch (error) {
        console.error('❌ Email error:', error);
        return false;
    }
};
