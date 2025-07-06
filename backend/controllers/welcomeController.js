const bcrypt = require('bcryptjs');
const { Booking, User, Event, Venue, Shift, Package, Otp } = require('../models');
const { validationResult, check } = require('express-validator');
const sendEmail = require('../utils/sendEmail');
const sendSMS = require('../utils/sendSMS');
const { Op } = require('sequelize');

// Helper: Format phone number for SMS
const formatPhoneNumber = (phone) => {
  if (!phone) return null;
  // Remove non-digits
  let cleaned = phone.replace(/\D/g, '');
  // If 10 digits (e.g., 9841234567), assume Nepal and add +977
  if (cleaned.length === 10) {
    return `+977${cleaned}`;
  }
  // If already includes +977 or other country code, return as is
  if (cleaned.length > 10 && phone.startsWith('+')) {
    return phone;
  }
  // Invalid format
  return null;
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name || 'User',
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

exports.getEvents = async (req, res) => {
  try {
    const events = await Event.findAll({
      attributes: ['id', 'name'],
    });
    res.json({ events });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Failed to fetch events' });
  }
};

exports.getVenues = async (req, res) => {
  try {
    const venues = await Venue.findAll({
      attributes: ['id', 'name'],
    });
    res.json({ venues });
  } catch (error) {
    console.error('Error fetching venues:', error);
    res.status(500).json({ message: 'Failed to fetch venues' });
  }
};

exports.checkAvailability = async (req, res) => {
  const { venueId, event_date, guestCount, shiftId } = req.body;

  try {
    if (!venueId || !event_date || !guestCount || !shiftId) {
      return res.status(400).json({ message: 'Please provide venue, event date, guest count, and shift' });
    }

    // Validate venue exists
    const venue = await Venue.findByPk(venueId);
    if (!venue) {
      return res.status(404).json({ message: 'Venue not found' });
    }

    // Validate shift exists
    const shift = await Shift.findByPk(shiftId);
    if (!shift) {
      return res.status(404).json({ message: 'Shift not found' });
    }

    // Check for conflicting bookings
    const conflictingBooking = await Booking.findOne({
      where: {
        venueId,
        event_date,
        shiftId,
      },
    });

    if (conflictingBooking) {
      return res.status(400).json({ message: 'Venue is not available for this date and shift' });
    }

    res.json({ available: true });
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({ message: 'Failed to check availability' });
  }
};

exports.sendOTP = [
  check('email').isEmail().withMessage('Invalid email address'),
  check('phone').isMobilePhone('any').withMessage('Invalid phone number'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { email, phone } = req.body;

    try {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Set OTP expiration (5 minutes)
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      // Store OTP in database
      await Otp.create({
        user_id: user.id,
        otp_code: otp,
        expires_at: expiresAt,
      });

      // Format phone number
      const formattedPhone = formatPhoneNumber(phone);
      if (!formattedPhone) {
        return res.status(400).json({ message: 'Invalid phone number format' });
      }

      // Email content
      const html = `
        <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 30px; border-radius: 10px; max-width: 600px; margin: auto;">
          <h2 style="color: #4CAF50;">Your OTP Code</h2>
          <p style="font-size: 16px; color: #333;">
            Hello ${user.name || 'User'},
          </p>
          <p style="font-size: 16px; color: #333;">
            Your One-Time Password (OTP) for EventEase booking verification is:
          </p>
          <h3 style="color: #4CAF50; font-size: 24px; text-align: center; margin: 20px 0;">
            ${otp}
          </h3>
          <p style="font-size: 16px; color: #333;">
            This OTP is valid for 5 minutes. Please do not share it with anyone.
          </p>
          <hr style="margin: 30px 0;">
          <p style="font-size: 12px; color: #999;">
            If you didn’t request this OTP, please ignore this email or contact our support.
          </p>
          <p style="font-size: 12px; color: #999;">
            Thank you,<br>EventEase Team
          </p>
        </div>
      `;

      // SMS content
      const smsText = `EventEase: Your OTP is ${otp}. Valid for 5 minutes. Do not share.`;

      // Send email and SMS concurrently
      const [emailSent, smsSent] = await Promise.all([
        sendEmail({
          to: email,
          subject: 'Your EventEase OTP Code',
          html,
        }).catch((err) => {
          console.error('Failed to send OTP email:', err);
          return false;
        }),
        sendSMS({
          to: formattedPhone,
          text: smsText,
        }).catch((err) => {
          console.error('Failed to send OTP SMS:', err);
          return false;
        }),
      ]);

      if (!emailSent && !smsSent) {
        return res.status(500).json({ message: 'Failed to send OTP via email and SMS' });
      }

      res.json({
        message: 'OTP sent successfully',
        emailSent,
        smsSent,
      });
    } catch (error) {
      console.error('Error sending OTP:', error);
      res.status(500).json({ message: 'Failed to send OTP' });
    }
  },
];

exports.step1 = async (req, res) => {
  try {
    const events = await Event.findAll({ attributes: ['id', 'name'] });
    const venues = await Venue.findAll({ attributes: ['id', 'name'] });
    const shifts = await Shift.findAll({ attributes: ['id', 'name'] });
    res.json({ events, venues, shifts });
  } catch (error) {
    console.error('Error fetching step1 data:', error);
    res.status(500).json({ message: 'Failed to fetch step1 data' });
  }
};

exports.step1Post = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const { event_id, venue_id, shift_id, event_date, guest_count } = req.body;

  try {
    // Validate existence
    const event = await Event.findByPk(event_id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const venue = await Venue.findByPk(venue_id);
    if (!venue) return res.status(404).json({ message: 'Venue not found' });

    const shift = await Shift.findByPk(shift_id);
    if (!shift) return res.status(404).json({ message: 'Shift not found' });

    // Check availability
    const conflictingBooking = await Booking.findOne({
      where: { venue_id, event_date, shift_id },
    });
    if (conflictingBooking) {
      return res.status(400).json({ message: 'Venue is not available for this date and shift' });
    }

    res.json({ message: 'Step 1 validated successfully' });
  } catch (error) {
    console.error('Error in step1Post:', error);
    res.status(500).json({ message: 'Failed to process step1' });
  }
};

exports.step2 = async (req, res) => {
  // Placeholder: Fetch packages and menus
  try {
    const packages = await Package.findAll({ attributes: ['id', 'name'] });
    const menus = await Menu.findAll({ attributes: ['id', 'name'] });
    res.json({ packages, menus });
  } catch (error) {
    console.error('Error fetching step2 data:', error);
    res.status(500).json({ message: 'Failed to fetch step2 data' });
  }
};

exports.step2Post = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const { package_id, selected_menus } = req.body;

  try {
    // Validate package and menus
    const packageItem = await Package.findByPk(package_id);
    if (!packageItem) return res.status(404).json({ message: 'Package not found' });

    // Validate menus (adjust as needed)
    if (!Array.isArray(selected_menus) || selected_menus.length === 0) {
      return res.status(400).json({ message: 'Invalid menu selections' });
    }

    res.json({ message: 'Step 2 validated successfully' });
  } catch (error) {
    console.error('Error in step2Post:', error);
    res.status(500).json({ message: 'Failed to process step2' });
  }
};

exports.step3 = async (req, res) => {
  res.json({ message: 'Step 3: OTP verification' });
};

exports.step3Post = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const { userId, otp, name } = req.body;

  try {
    const user = await User.findByPk(userId);
    if (!user || user.name !== name) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Simulate OTP verification
    const isValidOtp = otp === '123456'; // Placeholder
    if (!isValidOtp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Error in step3Post:', error);
    res.status(500).json({ message: 'Failed to verify OTP' });
  }
};

exports.step4 = async (req, res) => {
  res.json({ message: 'Step 4: Final confirmation' });
};

exports.storeBooking = async (req, res) => {
  const { userId, event_id, venue_id, shift_id, event_date, guest_count, package_id, selected_menus } = req.body;

  try {
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const booking = await Booking.create({
      userId,
      eventId: event_id,
      venueId: venue_id,
      shiftId: shift_id,
      event_date,
      guestCount: guest_count,
      packageId: package_id,
      selectedMenus: selected_menus,
    });

    res.json({ message: 'Booking created successfully', bookingId: booking.id });
  } catch (error) {
    console.error('Error storing booking:', error);
    res.status(500).json({ message: 'Failed to store booking' });
  }
};

exports.calculateFare = async (req, res) => {
  const { package_id, guest_count } = req.body;

  try {
    // Placeholder fare calculation
    const packageItem = await Package.findByPk(package_id);
    if (!packageItem) return res.status(404).json({ message: 'Package not found' });

    const fare = packageItem.price * guest_count;
    res.json({ fare });
  } catch (error) {
    console.error('Error calculating fare:', error);
    res.status(500).json({ message: 'Failed to calculate fare' });
  }
};

exports.verifyOTP = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const { otp } = req.body;

  try {
    const otpRecord = await Otp.findOne({
      where: {
        otp_code: otp,
        expires_at: { [Op.gt]: new Date() },
      },
      include: [{ model: User }],
    });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    console.log(`OTP verified for user_id: ${otpRecord.user_id}`);
    await otpRecord.destroy();

    res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Failed to verify OTP' });
  }
};

exports.sendConfirmation = [
  check('bookingId').notEmpty().withMessage('Booking ID is required').isInt().withMessage('Booking ID must be an integer'),
  check('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Email must be valid'),
  check('phone').isMobilePhone('any').withMessage('Invalid phone number').optional({ nullable: true }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', JSON.stringify(errors.array(), null, 2));
      return res.status(400).json({ errors: errors.array() });
    }

    const { bookingId, email, phone } = req.body;

    try {
      // Fetch booking with related data, including aliases
      const booking = await Booking.findByPk(bookingId, {
        include: [
          { model: Event, as: 'event', attributes: ['name'] },
          { model: Venue, as: 'venue', attributes: ['name'] },
          { model: Shift, as: 'shift', attributes: ['name'] },
          { model: Package, as: 'package', attributes: ['name'] },
          { model: User, as: 'user', attributes: ['name', 'phone'] },
        ],
      });

      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }

      // Log selected_menus for debugging
      console.log('Raw selected_menus:', booking.selected_menus);

      // Handle selected_menus
      let selectedMenus = booking.selected_menus || {};
      if (typeof selectedMenus === 'string') {
        try {
          selectedMenus = JSON.parse(selectedMenus);
        } catch (parseError) {
          console.error('Failed to parse selected_menus:', parseError);
          selectedMenus = {};
        }
      }

      if (!selectedMenus || typeof selectedMenus !== 'object') {
        console.warn('selectedMenus is invalid, defaulting to {}');
        selectedMenus = {};
      }

      // Format selected menus for email
      const menuItemsHtml = Object.entries(selectedMenus)
        .map(([menuId, items]) => {
          if (!Array.isArray(items)) return '';
          return `
            <h3>Menu ${menuId}</h3>
            <ul style="list-style-type: disc; margin-left: 20px;">
              ${items.map((item) => `<li>${item}</li>`).join('')}
            </ul>
          `;
        })
        .filter(Boolean)
        .join('');

      // Use customer_phone or user.phone
      const formattedPhone = formatPhoneNumber(booking.customer_phone || booking.user?.phone || phone);
      if (!formattedPhone) {
        console.warn('No valid phone number provided for booking:', bookingId);
      }

      // Format date
      const formattedDate = new Date(booking.event_date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      // Construct HTML email
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #1a73e8; text-align: center;">Booking Confirmation - EventEase</h2>
          <p style="color: #333; font-size: 16px;">Dear ${booking.customer_name || booking.user?.name || 'Customer'},</p>
          <p style="color: #333; font-size: 16px;">Thank you for booking with EventEase! Below are the details of your event:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 8px; border: 1px solid #e0e0e0; font-weight: bold;">Booking ID</td>
              <td style="padding: 8px; border: 1px solid #e0e0e0;">${booking.id}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #e0e0e0; font-weight: bold;">Event Type</td>
              <td style="padding: 8px; border: 1px solid #e0e0e0;">${booking.event?.name || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #e0e0e0; font-weight: bold;">Venue</td>
              <td style="padding: 8px; border: 1px solid #e0e0e0;">${booking.venue?.name || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #e0e0e0; font-weight: bold;">Date</td>
              <td style="padding: 8px; border: 1px solid #e0e0e0;">${formattedDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #e0e0e0; font-weight: bold;">Time Slot</td>
              <td style="padding: 8px; border: 1px solid #e0e0e0;">${booking.shift?.name || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #e0e0e0; font-weight: bold;">Package</td>
              <td style="padding: 8px; border: 1px solid #e0e0e0;">${booking.package?.name || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #e0e0e0; font-weight: bold;">Guest Count</td>
              <td style="padding: 8px; border: 1px solid #e0e0e0;">${booking.guest_count}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #e0e0e0; font-weight: bold;">Selected Menus</td>
              <td style="padding: 8px; border: 1px solid #e0e0e0;">
                ${menuItemsHtml || 'None'}
              </td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #e0e0e0; font-weight: bold;">Base Fare</td>
              <td style="padding: 8px; border: 1px solid #e0e0e0;">$${booking.base_fare || 0}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #e0e0e0; font-weight: bold;">Extra Charges</td>
              <td style="padding: 8px; border: 1px solid #e0e0e0;">$${booking.extra_charges || 0}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #e0e0e0; font-weight: bold;">Total Fare</td>
              <td style="padding: 8px; border: 1px solid #e0e0e0;">$${booking.total_fare || 0}</td>
            </tr>
          </table>
          <p style="color: #333; font-size: 16px;">We look forward to hosting your event! If you have any questions, please contact us at <a href="mailto:${process.env.EMAIL_USER}" style="color: #1a73e8;">${process.env.EMAIL_USER}</a>.</p>
          <p style="color: #333; font-size: 16px;">Best regards,<br>The EventEase Team</p>
        </div>
      `;

      // SMS content
      const smsText = `EventEase: Booking confirmed (ID: ${booking.id}) for ${booking.event?.name || 'N/A'} on ${formattedDate} at ${booking.venue?.name || 'N/A'}. Total: $${booking.total_fare || 0}.`;

      // Send email and SMS concurrently
      const [emailSent, smsSent] = await Promise.all([
        sendEmail({
          to: email,
          subject: 'EventEase - Booking Confirmation',
          html,
        }).catch((err) => {
          console.error('Failed to send confirmation email for booking:', bookingId, err);
          return false;
        }),
        formattedPhone
          ? sendSMS({
              to: formattedPhone,
              text: smsText,
            }).catch((err) => {
              console.error('Failed to send confirmation SMS for booking:', bookingId, err);
              return false;
            })
          : Promise.resolve(false),
      ]);

      if (!emailSent && !smsSent) {
        return res.status(500).json({ message: 'Failed to send confirmation via email and SMS' });
      }

      res.json({
        message: 'Confirmation sent successfully',
        emailSent,
        smsSent,
      });
    } catch (error) {
      console.error('Error sending confirmation:', error);
      res.status(500).json({ message: 'Failed to send confirmation' });
    }
  },
];