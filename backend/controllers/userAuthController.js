const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { User, Otp, Sequelize } = require('../models');
const { generateToken } = require('../utils/token');
const sendEmail = require('../utils/sendEmail');
const sendSMS = require('../utils/sendSMS');

const { Op } = require('sequelize');

// Helper: Format phone number for SMS
const formatPhoneNumber = (phone) => {
  if (!phone) return null;
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+977${cleaned}`;
  }
  if (cleaned.length > 10 && phone.startsWith('+')) {
    return phone;
  }
  return null;
};



// Helper: Format phone number for SMS


exports.signup = async (req, res) => {
  const { name, email, password, phone } = req.body;

  try {
    // Basic field validation
    if (!name || !email || !password || !phone) {
      console.log('Missing fields:', { name, email, hasPassword: !!password, phone });
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Password format validation
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#_\-+])[A-Za-z\d@$!%*?&^#_\-+]{8,}$/;
    if (!passwordRegex.test(password)) {
      console.log('Invalid password format:', { email, passwordLength: password.length });
      return res.status(400).json({
        message: 'Password must be at least 8 characters long and include one uppercase letter, one number, and one special character.',
      });
    }

    // Phone number validation
    if (!/^\d{10}$/.test(phone)) {
      console.log('Invalid phone format:', { phone });
      return res.status(400).json({ message: 'Phone number must be exactly 10 digits.' });
    }

    // Check if user already exists
    const emailLower = email.trim().toLowerCase();
    const existingUser = await User.findOne({
      where: {
        [Sequelize.Op.or]: [{ email: emailLower }, { phone }],
      },
    });

    if (existingUser) {
      console.log('Existing user:', { email: emailLower, phone });
      return res.status(409).json({
        message: existingUser.email === emailLower ? 'Email already exists' : 'Phone number already exists',
      });
    }

    // Create new user (password will be hashed by beforeCreate hook)
    const user = await User.create({
      name,
      email: emailLower,
      password, // Pass raw password; hook will hash it
      phone,
      email_verified: true,
    });

    // Set session
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: 'user',
    };

    // Format phone number for SMS
    const formattedPhone = formatPhoneNumber(phone);
    console.log('Formatted phone for SMS:', formattedPhone);

    // Send SMS with credentials
    let smsSent = false;
    if (formattedPhone) {
      const smsText = `EventEase: Welcome, ${name}! Your account is created. Email: ${emailLower}, Phone: ${formattedPhone}, Password: ${password}. Keep this safe.`;
      console.log('SMS content:', { to: formattedPhone, text: smsText });
      try {
        await sendSMS({
          to: formattedPhone,
          text: smsText,
        });
        console.log(`SMS sent successfully to ${formattedPhone} for user ${user.id}`);
        smsSent = true;
      } catch (smsError) {
        console.error(`Failed to send SMS to ${formattedPhone} for user ${user.id}:`, smsError);
      }
    } else {
      console.warn(`No valid phone number for SMS for user ${user.id}`);
    }

    console.log('User created:', { id: user.id, email: user.email });
    return res.status(201).json({
      message: 'User registered successfully',
      user,
      smsSent,
    });
  } catch (error) {
    console.error('User signup error:', error);
    return res.status(500).json({ error: 'Failed to register user' });
  }
};
exports.verifyEmail = async (req, res) => {
  try {
    const { token, email } = req.query;
    if (!token || !email) {
      return res.render('verify-email', {
        status: 'error',
        message: 'Missing token or email.',
        email: decodeURIComponent(email || ''),
      });
    }
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      where: {
        email: decodeURIComponent(email),
        verification_token: hashedToken,
        verification_token_expires: { [Op.gt]: new Date() },
      },
    });
    if (!user) {
      return res.render('verify-email', {
        status: 'error',
        message: 'Invalid or expired verification token.',
        email: decodeURIComponent(email),
      });
    }
    await user.update({ email_verified: true, verification_token: null, verification_token_expires: null });
    res.render('verify-email', {
      status: 'success',
      message: 'Email verified successfully!',
      email: decodeURIComponent(email),
    });
  } catch (err) {
    console.error('Verify email error:', err);
    res.render('verify-email', {
      status: 'error',
      message: 'An error occurred during verification.',
      email: decodeURIComponent(req.query.email || ''),
    });
  }
};

exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.query;
    const decodedEmail = decodeURIComponent(email);
    const user = await User.findOne({ where: { email: decodedEmail } });
    if (!user) {
      return res.render('verify-email', {
        status: 'error',
        message: 'Email not found.',
        email: decodedEmail,
      });
    }

    const { raw, hash } = generateToken();
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour
    await user.update({
      verification_token: hash,
      verification_token_expires: expires,
    });

    const link = `${req.protocol}://${req.get('host')}/api/verify-email?token=${raw}&email=${encodeURIComponent(decodedEmail)}`;
    const formattedPhone = formatPhoneNumber(user.phone);
    if (!formattedPhone) {
      console.warn('Invalid phone number for user:', user.id);
    }

    // Email content
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 30px; border-radius: 10px; max-width: 600px; margin: auto;">
        <h2 style="color: #4CAF50;">Verify Your Email - EventEase</h2>
        <p style="font-size: 16px; color: #333;">Hello ${user.name || 'User'},</p>
        <p style="font-size: 16px; color: #333;">Please click the button below to verify your email address:</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${link}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email</a>
        </p>
        <p style="font-size: 14px; color: #666;">Or copy and paste this link into your browser:<br><a href="${link}" style="color: #4CAF50;">${link}</a></p>
        <hr style="margin: 30px 0;">
        <p style="font-size: 12px; color: #999;">If you didn’t request this, ignore this email or contact support@aonecafe.com.</p>
      </div>
    `;

    // SMS content (shortened due to SMS length limits)
    const smsText = `EventEase: Verify your email: ${link}`;

    // Send email and SMS concurrently
    const [emailSent, smsSent] = await Promise.all([
      sendEmail({
        to: decodedEmail,
        subject: 'Verify Your Email - EventEase',
        html: emailHtml,
      }).catch((err) => {
        console.error('Failed to send verification email:', err);
        return false;
      }),
      formattedPhone
        ? sendSMS({
            to: formattedPhone,
            text: smsText,
          }).catch((err) => {
            console.error('Failed to send verification SMS:', err);
            return false;
          })
        : Promise.resolve(false),
    ]);

    if (!emailSent && !smsSent) {
      return res.render('verify-email', {
        status: 'error',
        message: 'Failed to send verification link via email and SMS.',
        email: decodedEmail,
      });
    }

    res.render('verify-email', {
      status: 'success',
      message: 'Verification link sent to your email and phone.',
      email: decodedEmail,
    });
  } catch (err) {
    console.error('Resend verification error:', err);
    res.render('verify-email', {
      status: 'error',
      message: 'Error resending verification link.',
      email: decodeURIComponent(req.query.email || ''),
    });
  }
};

// exports.signup = async (req, res) => {
//   const { name, email, password, phone } = req.body;

//   try {
//     // Basic field validation
//     if (!name || !email || !password || !phone) {
//       console.log('Missing fields:', { name, email, hasPassword: !!password, phone });
//       return res.status(400).json({ message: 'All fields are required' });
//     }

//     // Password format validation
//     const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#_\-+])[A-Za-z\d@$!%*?&^#_\-+]{8,}$/;
//     if (!passwordRegex.test(password)) {
//       console.log('Invalid password format:', { email, passwordLength: password.length });
//       return res.status(400).json({
//         message: 'Password must be at least 8 characters long and include one uppercase letter, one number, and one special character.',
//       });
//     }

//     // Phone number validation
//     if (!/^\d{10}$/.test(phone)) {
//       console.log('Invalid phone format:', { phone });
//       return res.status(400).json({ message: 'Phone number must be exactly 10 digits.' });
//     }

//     // Check if user already exists
//     const emailLower = email.trim().toLowerCase();
//     const existingUser = await User.findOne({
//       where: {
//         [Sequelize.Op.or]: [{ email: emailLower }, { phone }],
//       },
//     });

//     if (existingUser) {
//       console.log('Existing user:', { email: emailLower, phone });
//       return res.status(409).json({
//         message: existingUser.email === emailLower ? 'Email already exists' : 'Phone number already exists',
//       });
//     }

//     // Create new user (password will be hashed by beforeCreate hook)
//     const user = await User.create({
//       name,
//       email: emailLower,
//       password, // Pass raw password; hook will hash it
//       phone,
//       email_verified: true,
//     });

//     // Set session
//     req.session.user = {
//       id: user.id,
//       name: user.name,
//       email: user.email,
//       phone: user.phone,
//       role:"user",
//     };

//     console.log('User created:', { id: user.id, email: user.email });
//     return res.status(201).json({ message: 'User registered successfully', user });
//   } catch (error) {
//     console.error('User signup error:', error);
//     return res.status(500).json({ error: 'Failed to register user' });
//   }
// };



exports.login = async (req, res) => {
  let { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    email = email.trim().toLowerCase();
    password = password.trim();

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials (email not found)' });
    }

    if (!user.email_verified) {
      return res.status(403).json({ message: 'Email not verified' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // console.log('Password mismatch. Input:', password, 'Stored:', user.password);
      return res.status(401).json({ message: 'Invalid credentials (wrong password)' });
    }

    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role || 'user',
    };

    return res.status(200).json({ message: 'Logged in successfully', user });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Login failed' });
  }
};


exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ message: 'Error logging out' });
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out successfully' });
  });
};

exports.getUserById = async (req, res) => {
  const userId = req.params.id;

  try {
    if (!req.session.userId || req.session.userId !== userId) {
      return res.status(403).json({ message: 'Unauthorized: You can only access your own data' });
    }

    const user = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'phone', 'role'],
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (err) {
    console.error('Fetch user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  const { name, email, phone } = req.body;
  const userId = req.params.id;

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validation
    const errors = [];
    if (name !== undefined && name.trim() === '') {
      errors.push({ field: 'name', message: 'Name cannot be empty' });
    }
    if (email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push({ field: 'email', message: 'Valid email is required' });
    }
    if (phone !== undefined && !/^\d{10}$/.test(phone)) {
      errors.push({ field: 'phone', message: 'Phone number must be exactly 10 digits' });
    }
    if (errors.length > 0) {
      return res.status(422).json({ errors });
    }

    // Check email or phone uniqueness
    if (email !== user.email || phone !== user.phone) {
      const existing = await User.findOne({
        where: {
          [Sequelize.Op.or]: [
            email !== user.email ? { email } : null,
            phone !== user.phone ? { phone } : null,
          ].filter(Boolean),
          id: { [Sequelize.Op.ne]: userId },
        },
      });
      if (existing) {
        return res.status(409).json({
          message: existing.email === email ? 'Email already taken' : 'Phone number already taken',
        });
      }
    }

    // Handle email change
    if (email !== undefined && email !== user.email) {
      user.email_verified = false;
      const { raw, hash } = generateToken();
      user.verification_token = hash;
      user.verification_token_expires = new Date(Date.now() + 1000 * 60 * 60);
      const link = `${req.protocol}://${req.get('host')}/api/verify-email?token=${raw}&email=${encodeURIComponent(email)}`;
      const formattedPhone = formatPhoneNumber(phone || user.phone);
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 30px; border-radius: 10px; max-width: 600px; margin: auto;">
          <h2 style="color: #4CAF50;">Verify Your New Email Address</h2>
          <p style="font-size: 16px; color: #333;">Hello ${user.name || 'User'},</p>
          <p style="font-size: 16px; color: #333;">Please click the button below to verify your new email address:</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${link}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email</a>
          </p>
          <p style="font-size: 14px; color: #666;">Or copy and paste this link into your browser:<br><a href="${link}" style="color: #4CAF50;">${link}</a></p>
          <hr style="margin: 30px 0;">
          <p style="font-size: 12px; color: #999;">If you didn’t request this change, ignore this email or contact support@aonecafe.com.</p>
        </div>
      `;
      const smsText = `EventEase: Verify your new email: ${link}`;

      const [emailSent, smsSent] = await Promise.all([
        sendEmail({
          to: email,
          subject: 'Verify Your New Email Address - EventEase',
          html: emailHtml,
        }).catch((err) => {
          console.error('Failed to send email verification email:', err);
          return false;
        }),
        formattedPhone
          ? sendSMS({
              to: formattedPhone,
              text: smsText,
            }).catch((err) => {
              console.error('Failed to send email verification SMS:', err);
              return false;
            })
          : Promise.resolve(false),
      ]);

      if (!emailSent && !smsSent) {
        return res.status(500).json({ message: 'Failed to send verification link for new email.' });
      }
    }

    // Update fields
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (phone !== undefined) user.phone = phone;
    await user.save();

    res.json({
      message: 'Profile updated successfully. If you changed your email, please verify it.',
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role || 'user' },
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Error updating profile' });
  }
};

exports.updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.findByPk(req.session.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(401).json({ message: 'Incorrect current password' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Update password error:', err);
    res.status(500).json({ message: 'Error updating password' });
  }
};

exports.requestReset = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.json({ message: 'If user exists, reset link sent.' });

    const { raw, hash } = generateToken();
    user.reset_password_token = hash;
    user.reset_password_expires = Date.now() + 30 * 60 * 1000;
    await user.save();

    const link = `${req.protocol}://${req.get('host')}/api/reset-password?token=${raw}&email=${email}`;
    await sendEmail({
      to: email,
      subject: 'Reset Your Password - EventEase',
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 30px; border-radius: 10px; max-width: 600px; margin: auto;">
          <h2 style="color: #d9534f;">Password Reset Request</h2>
          <p style="font-size: 16px; color: #333;">Hello,</p>
          <p style="font-size: 16px; color: #333;">We received a request to reset your account password. Click the button below to continue:</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${link}" style="display: inline-block; background-color: #d9534f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
          </p>
          <p style="font-size: 14px; color: #666;">Or copy and paste this link into your browser:<br><a href="${link}" style="color: #d9534f;">${link}</a></p>
          <hr style="margin: 30px 0;">
          <p style="font-size: 12px; color: #999;">If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
        </div>
      `,
    });

    res.json({ message: 'Reset link sent if user exists.' });
  } catch (err) {
    console.error('Request reset error:', err);
    res.status(500).json({ message: 'Error processing reset request' });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'No account found with that email address.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    user.reset_password_token = hash;
    user.reset_password_expires = Date.now() + 3600000;
    await user.save();

    const resetUrl = `http://localhost:5000/api/reset-password/${token}`;
    const emailContent = `
      <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 30px; border-radius: 10px; max-width: 600px; margin: auto;">
        <h2 style="color: #4CAF50;">Password Reset Request</h2>
        <p style="font-size: 16px; color: #333;">Hello,</p>
        <p style="font-size: 16px; color: #333;">You requested a password reset for your account. Please click the button below to set a new password:</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
        </p>
        <p style="font-size: 14px; color: #666;">Or copy and paste this link into your browser:<br><a href="${resetUrl}" style="color: #4CAF50;">${resetUrl}</a></p>
        <p style="font-size: 14px; color: #666;">This link will expire in 1 hour.</p>
        <hr style="margin: 30px 0;">
        <p style="font-size: 12px; color: #999;">If you didn’t request this password reset, please ignore this email or contact our support.</p>
      </div>
    `;

    await sendEmail({
      to: email,
      subject: 'Password Reset Request - EventEase',
      html: emailContent,
    });

    res.json({ message: 'Password reset link sent to your email.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Error processing request. Please try again.' });
  }
};

exports.renderResetPassword = async (req, res) => {
  const { token } = req.params;
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  try {
    const user = await User.findOne({
      where: {
        reset_password_token: hash,
        reset_password_expires: { [Op.gt]: Date.now() },
      },
    });

    if (!user) {
      return res.render('resetPassword', { error: 'Invalid or expired token.', message: null, token });
    }

    res.render('resetPassword', { error: null, message: null, token });
  } catch (err) {
    console.error('Render reset password error:', err);
    res.render('resetPassword', { error: 'Error loading reset page.', message: null, token });
  }
};

exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  try {
    if (password !== confirmPassword) {
      return res.render('resetPassword', {
        error: 'Passwords do not match.',
        message: null,
        token,
      });
    }

    const user = await User.findOne({
      where: {
        reset_password_token: hash,
        reset_password_expires: { [Op.gt]: Date.now() },
      },
    });

    if (!user) {
      return res.render('resetPassword', {
        error: 'Invalid or expired token.',
        message: null,
        token,
      });
    }

    user.password = await bcrypt.hash(password, 10);
    user.reset_password_token = null;
    user.reset_password_expires = null;
    await user.save();

    res.render('resetPassword', {
      error: null,
      message: 'Password has been reset. You can now sign in.',
      token,
    });
  } catch (err) {
    console.error('Reset password error:', err);
    res.render('resetPassword', {
      error: 'Error resetting password.',
      message: null,
      token,
    });
  }
};

exports.checkSession = async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  try {
    const user = await User.findByPk(req.session.userId);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    res.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role },
    });
  } catch (error) {
    console.error('Check session error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).send('User ID is required');
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).send('User not found');
    }

    await Otp.destroy({ where: { user_id: id } });
    await user.destroy();

    res.status(200).json({ message: 'User and associated OTPs deleted successfully.' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).send('Error deleting user');
  }
};



// exports.logout = (req, res) => {
//   req.session.destroy(err => {
//     if (err) {
//       return res.status(500).json({ error: 'Logout failed' });
//     }
//     res.clearCookie('connect.sid');
//     return res.status(200).json({ message: 'Logged out successfully' });
//   });
// };
