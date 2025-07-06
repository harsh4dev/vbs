const { Admin, Sequelize } = require('../../models');  // Ensure this is correctly pointing to your models
const bcrypt = require('bcrypt');
const crypto = require('crypto');
// const { generateToken } = require('../utils/token');
const sendEmail = require('../../utils/sendEmail');
const { Op } = require('sequelize');




// Admin Signup
exports.signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingAdmin = await Admin.findOne({ where: { email } });
    if (existingAdmin) {
      return res.status(409).json({ message: 'Admin already exists with this email' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      name,
      email,
      password: hashedPassword
    });

    req.session.admin = {
      id: admin.id,
      name: admin.name,
      email: admin.email
    };

    return res.status(201).json({ message: 'Admin registered successfully', admin });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'Failed to register admin' });
  }
};

// Admin Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ where: { email } });

    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    req.session.admin = {
      id: admin.id,
      name: admin.name,
      email: admin.email
    };

    return res.status(200).json({ message: 'Logged in successfully', admin });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Login failed' });
  }
};


exports.updateAdmin = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).send('Name and email are required');
    }

    const user = await Admin.findByPk(req.params.id);
    const emailExists = await Admin.findOne({
      where: {
        email,
        id: { [Sequelize.Op.ne]: req.params.id },
      },
    });

    if (emailExists) {
      return res.status(400).send('email already exists');
    }

    const updateData = { name, email };

    await user.update(updateData);
    res.status(201).json({ message: 'User updated' });
  } catch (err) {
    res.status(500).send('Error updating user');
    console.log(err);
  }
};











exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await Admin.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'No account found with that email address.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    user.reset_password_token = hash;
    user.reset_password_expires = Date.now() + 3600000; // 1 hour expiry
    await user.save();

    const resetUrl = `https://noded.harshchaudhary.com.np/api/admin/reset-password/${token}`;
    const emailContent = `
      <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 30px; border-radius: 10px; max-width: 600px; margin: auto;">
        <h2 style="color: #4CAF50;">Password Reset Request</h2>
        <p style="font-size: 16px; color: #333;">
          Hello,
        </p>
        <p style="font-size: 16px; color: #333;">
          You requested a password reset for your account. Please click the button below to set a new password:
        </p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Reset Password
          </a>
        </p>
        <p style="font-size: 14px; color: #666;">
          Or copy and paste this link into your browser:<br>
          <a href="${resetUrl}" style="color: #4CAF50;">${resetUrl}</a>
        </p>
        <p style="font-size: 14px; color: #666;">
          This link will expire in 1 hour.
        </p>
        <hr style="margin: 30px 0;">
        <p style="font-size: 12px; color: #999;">
          If you didn’t request this password reset, please ignore this email or contact our support.
        </p>
      </div>
    `;

    await sendEmail({
      to: email,
      subject: 'Password Reset Request',
      html: emailContent,
    });

    res.json({ message: 'Password reset link sent to your email.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Error processing request. Please try again.' });
  }
};

exports.renderAdminResetPassword = async (req, res) => {
  const { token } = req.params;
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  const frontendUrl = process.env.FRONTEND_URL;

  try {
    const user = await Admin.findOne({
      where: {
        reset_password_token: hash,
        reset_password_expires: { [Op.gt]: Date.now() },
      },
    });

    if (!user) {
      return res.render('adminResetPassword', { error: 'Invalid or expired token.', message: null, token, frontendUrl });
    }

    res.render('adminResetPassword', { error: null, message: null, token, frontendUrl });
  } catch (err) {
    console.error('Render reset password error:', err);
    res.render('adminResetPassword', { error: 'Error loading reset page.', message: null, token, frontendUrl });
  }
};

exports.resetAdminPassword = async (req, res) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  try {
    if (password !== confirmPassword) {
      return res.render('adminResetPassword', {
        error: 'Passwords do not match.',
        message: null,
        token,
        frontendUrl,
      });
    }

    const user = await Admin.findOne({
      where: {
        reset_password_token: hash,
        reset_password_expires: { [Op.gt]: Date.now() },
      },
    });

    if (!user) {
      return res.render('adminResetPassword', {
        error: 'Invalid or expired token.',
        message: null,
        token,
        frontendUrl,
      });
    }

    user.password = await bcrypt.hash(password, 10);
    user.reset_password_token = null;
    user.reset_password_expires = null;
    await user.save();

    res.render('adminResetPassword', {
      error: null,
      message: 'Password has been reset. You can now sign in.',
      token,
      frontendUrl,
    });
  } catch (err) {
    console.error('Reset password error:', err);
    res.render('adminResetPassword', {
      error: 'Error resetting password.',
      message: null,
      token,
      frontendUrl,
    });
  }
};




// Admin Logout
exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.clearCookie('connect.sid');
    return res.status(200).json({ message: 'Logged out successfully' });
  });
};
