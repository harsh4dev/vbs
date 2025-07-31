const { Booking, Event, Venue, Shift, Package, Menu, User } = require('../../models');
const { body, validationResult } = require('express-validator');
const sendEmail = require('../../utils/sendEmail');
const sendSMS = require('../../utils/sendSMS');

// Initialize booking session
exports.initiateBooking = async (req, res) => {
  try {
    const sessionId = req.sessionID;const formatPhoneNumber = (phone) => {
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
    const events = await Event.findAll();
    const venues = await Venue.findAll();
    const shifts = await Shift.findAll();
    req.session.bookingData = req.session.bookingData || {};
    res.json({ sessionId, events, venues, shifts });
  } catch (error) {
    console.error('Error initiating booking:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get bookings by user ID
exports.getBookingsByUserId = async (req, res) => {
  try {
    const { user_id } = req.params;
    console.log('Fetching bookings for user ID:', user_id);

    const user = await User.findByPk(user_id);
    if (!user) {
      console.error('User not found with ID:', user_id);
      return res.status(404).json({ message: 'User not found' });
    }

    const bookings = await Booking.findAll({
      where: { user_id },
      include: [
        { model: Event, as: 'event', required: false },
        { model: Venue, as: 'venue', required: false },
        { model: Shift, as: 'shift', required: false },
        { model: Package, as: 'package', required: false },
      ],
    });

    if (!bookings || bookings.length === 0) {
      console.error('No bookings found for user ID:', user_id);
      return res.status(404).json({ message: 'No bookings found for this user' });
    }

    console.log('User bookings data:', bookings);
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings by user ID:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Check date availability
exports.checkDate = [
  body('event_date').isDate().withMessage('Invalid date'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { event_date } = req.body;
    try {
      const bookings = await Booking.count({ where: { event_date } });
      const available = bookings < 10;
      res.json({ available });
    } catch (error) {
      console.error('Error checking date:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
];

// Check booking availability
exports.checkBookingAvailability = [
  body('event_id').notEmpty().withMessage('Event is required'),
  body('venue_id').notEmpty().withMessage('Venue is required'),
  body('shift_id').notEmpty().withMessage('Shift is required'),
  body('event_date').isDate().withMessage('Event date is required'),
  body('guest_count').isInt({ min: 1 }).withMessage('Guest count must be a number'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { event_id, venue_id, shift_id, event_date, guest_count } = req.body;

    try {
      const venue = await Venue.findByPk(venue_id);
      if (!venue || venue.capacity < guest_count) {
        return res.status(400).json({ error: 'Venue capacity exceeded or invalid venue' });
      }
      const existingBooking = await Booking.findOne({
        where: { event_date, venue_id, shift_id },
      });
      if (existingBooking) {
        return res.status(400).json({ error: 'Venue is already booked for this date and shift' });
      }
      req.session.bookingData = {
        ...req.session.bookingData,
        event_id,
        venue_id,
        shift_id,
        event_date,
        guest_count,
      };
      res.json({ message: 'Slot is available' });
    } catch (error) {
      console.error('Error checking availability:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
];

// Fetch packages
exports.selectPackage = async (req, res) => {
  try {
    const packages = await Package.findAll({
      attributes: ['id', 'name', 'base_price'],
    });
    res.json({ packages });
  } catch (error) {
    console.error('Error fetching packages:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get menus for a package
exports.getPackageMenus = async (req, res) => {
  const { packageId } = req.params;

  try {
    const menus = await Menu.findAll({
      where: { package_id: packageId },
      attributes: ['id', 'name', 'items', 'free_limit'],
    });
    res.json(
      menus.map((menu) => ({
        id: menu.id,
        name: menu.name,
        free_limit: menu.free_limit,
        items: menu.items.map((item, index) => ({
          name: item.name,
          price: item.price,
          index,
        })),
      })),
    );
  } catch (error) {
    console.error('Error fetching menus:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Calculate fare
exports.calculateFare = [
  body('package_id').isInt().withMessage('Invalid package ID'),
  body('guest_count').isInt({ min: 10 }).withMessage('Invalid guest count'),
  body('selected_menus').isObject().withMessage('Invalid menu selections'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { package_id, guest_count, selected_menus } = req.body;

    try {
      const pkg = await Package.findByPk(package_id);
      if (!pkg) {
        return res.status(404).json({ error: 'Package not found' });
      }
      let extra_charges = 0;
      for (const [menuId, itemIndexes] of Object.entries(selected_menus)) {
        const menu = await Menu.findByPk(menuId);
        if (!menu) continue;
        const free_limit = menu.free_limit || 0;
        if (itemIndexes.length > free_limit) {
          const extraItems = itemIndexes.slice(free_limit);
          for (const index of extraItems) {
            const item = menu.items[index];
            if (item && item.price != null) {
              extra_charges += item.price * guest_count;
            } else {
              extra_charges += 10 * guest_count; // Default price
            }
          }
        }
      }
      const base_fare = pkg.base_price * guest_count;
      const total_fare = base_fare + extra_charges;
      req.session.bookingData = {
        ...req.session.bookingData,
        package_id,
        guest_count,
        selected_menus,
        base_fare,
        extra_charges,
        total_fare,
      };
      res.json({ base_fare, extra_charges, total_fare });
    } catch (error) {
      console.error('Error calculating fare:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
];

// Store booking
exports.storeBooking = [
  body('user_id').isInt().withMessage('Valid user ID is required'),
  body('event_date').isDate().withMessage('Invalid event date'),
  body('event_id').isInt().withMessage('Invalid event ID'),
  body('guest_count').isInt({ min: 1 }).withMessage('Guest count must be a positive number'),
  body('venue_id').isInt().withMessage('Invalid venue ID'),
  body('shift_id').isInt().withMessage('Invalid shift ID'),
  body('package_id').isInt().withMessage('Invalid package ID'),
  body('selected_menus').isObject().withMessage('Invalid menu selections'),
  body('base_fare').isFloat({ min: 0 }).withMessage('Invalid base fare'),
  body('extra_charges').isFloat({ min: 0 }).withMessage('Invalid extra charges'),
  body('total_fare').isFloat({ min: 0 }).withMessage('Invalid total fare'),
  body('customer_phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .isString()
    .withMessage('Phone number must be a string')
    .matches(/^\+?\d{10,15}$|^\+\d{1,3}\s?\d{9,12}$/)
    .withMessage('Invalid phone number format'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', JSON.stringify(errors.array(), null, 2));
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      user_id,
      event_date,
      event_id,
      guest_count,
      venue_id,
      shift_id,
      package_id,
      selected_menus,
      base_fare,
      extra_charges,
      total_fare,
      customer_phone,
    } = req.body;

    try {
      const [user, event, venue, shift, pkg] = await Promise.all([
        User.findByPk(user_id),
        Event.findByPk(event_id),
        Venue.findByPk(venue_id),
        Shift.findByPk(shift_id),
        Package.findByPk(package_id),
      ]);
      if (!user) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
      if (!event || !venue || !shift || !pkg) {
        return res.status(400).json({ error: 'Invalid input data' });
      }
      if (venue.capacity < guest_count) {
        return res.status(400).json({ error: 'Venue capacity exceeded' });
      }
      const existingBooking = await Booking.findOne({
        where: { event_date, venue_id, shift_id },
      });
      if (existingBooking) {
        return res.status(400).json({ error: 'Venue is already booked for this date and shift' });
      }

      // Format phone number using the helper function
      const formattedPhone = formatPhoneNumber(customer_phone);
      if (!formattedPhone) {
        console.error('Invalid phone number provided:', customer_phone);
        return res.status(400).json({ error: 'Invalid phone number format' });
      }

      const booking = await Booking.create({
        user_id,
        event_date,
        event_id,
        guest_count,
        venue_id,
        shift_id,
        package_id,
        selected_menus,
        base_fare,
        extra_charges,
        total_fare,
        customer_phone: formattedPhone,
        status: 'pending',
      });

      req.session.bookingData = null;
      res.json({ bookingId: booking.id });
    } catch (error) {
      console.error('Error storing booking:', error.message, error.stack);
      res.status(500).json({
  error: 'Internal Server Error',
  message: error.message,
  stack: error.stack
});

    }
  },
];

// Update booking status
// exports.updateBookingStatus = [
//   body('status').notEmpty().withMessage('Status is required'),
//   async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }
//     try {
//       const { bookingId } = req.params;
//       const { status } = req.body;
//       // Normalize status
//       const normalizedStatus = status.toLowerCase().trim();
//       // Allow 'pending', 'confirmed', 'rejected', 'cancelled' statuses
//       if (!['pending', 'confirmed', 'rejected', 'cancelled'].includes(normalizedStatus)) {
//         console.warn(`Invalid status received: ${status}`);
//         return res.status(400).json({ error: 'Status must be pending, confirmed, rejected, or cancelled' });
//       }

//       const booking = await Booking.findByPk(bookingId, {
//         include: [
//           { model: Event, as: 'event' },
//           { model: Venue, as: 'venue' },
//           { model: Shift, as: 'shift' },
//           { model: Package, as: 'package' },
//           { model: User, as: 'user' },
//         ],
//       });
//       if (!booking) {
//         console.error(`Booking not found for ID: ${bookingId}`);
//         return res.status(404).json({ message: 'Booking not found' });
//       }

//       // Optional: Add status transition validation
//       const currentStatus = booking.status.toLowerCase();
//       if (currentStatus === 'cancelled' && !['pending', 'confirmed'].includes(normalizedStatus)) {
//         return res.status(400).json({ error: 'Cancelled bookings can only be set to pending or confirmed' });
//       }
//       if (currentStatus === 'rejected' && !['pending', 'cancelled'].includes(normalizedStatus)) {
//         return res.status(400).json({ error: 'Rejected bookings can only be set to pending or cancelled' });
//       }

//       booking.status = normalizedStatus;
//       await booking.save();

//       // Send notifications for confirmed or cancelled statuses
//       if (['confirmed', 'cancelled'].includes(normalizedStatus)) {
//         console.log(`Preparing notifications for booking ${bookingId}, status: ${normalizedStatus}`);
//         const email = booking.user?.email || 'default@example.com'; // Fallback email
//         // Use customer_phone from Booking, fallback to user.phone
//         let displayPhone = booking.customer_phone || booking.user?.phone || 'N/A';
//         const formattedPhone = formatPhoneNumber(booking.customer_phone || booking.user?.phone || phone);
//         // Format phone number to +977 for SMS
//         let smsPhone = displayPhone;
//         if (displayPhone !== 'N/A' && !displayPhone.startsWith('+977') && displayPhone.length === 10) {
//           displayPhone = `+977 ${displayPhone}`; // For display in email
//           smsPhone = `+977${displayPhone}`; // For SMS
//         }
//         const formattedDate = new Date(booking.event_date).toLocaleDateString('en-US', {
//           weekday: 'long',
//           year: 'numeric',
//           month: 'long',
//           day: 'numeric',
//         });

//         if (normalizedStatus === 'confirmed') {
//           // Email for confirmed status
//           console.log(`Preparing to send email for booking ${bookingId} to ${email}`);
//           const emailTitle = 'Booking Confirmed!';
//           const emailSubject = 'Your Booking is Confirmed!';
//           const emailMessage = 'We are thrilled to confirm your booking. Below are the details of your event:';
//           const emailClosing = 'Thank you for choosing our services! We look forward to making your event unforgettable.';

//           const emailHtml = `
//             <!DOCTYPE html>
//             <html lang="en">
//             <head>
//               <meta charset="UTF-8">
//               <meta name="viewport" content="width=device-width, initial-scale=1.0">
//               <title>${emailTitle}</title>
//               <style>
//                 body {
//                   font-family: 'Helvetica Neue', Arial, sans-serif;
//                   background-color: #f4f4f9;
//                   margin: 0;
//                   padding: 0;
//                   color: #333333;
//                 }
//                 .container {
//                   max-width: 600px;
//                   margin: 20px auto;
//                   background-color: #ffffff;
//                   border-radius: 8px;
//                   box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
//                   overflow: hidden;
//                 }
//                 .header {
//                   background-color: #4CAF50;
//                   padding: 20px;
//                   text-align: center;
//                   color: #ffffff;
//                 }
//                 .content {
//                   padding: 30px;
//                   font-size: 16px;
//                   line-height: 1.6;
//                   color: #555555;
//                 }
//                 .content h1 {
//                   font-size: 24px;
//                   color: #333333;
//                   margin-bottom: 20px;
//                   text-align: center;
//                 }
//                 .content p {
//                   margin: 10px 0;
//                 }
//                 .content table {
//                   width: 100%;
//                   border-collapse: collapse;
//                   margin: 20px 0;
//                 }
//                 .content table td {
//                   padding: 10px;
//                   border-bottom: 1px solid #eeeeee;
//                 }
//                 .content table td.label {
//                   font-weight: bold;
//                   color: #333333;
//                   width: 40%;
//                 }
//                 .highlight {
//                   color: #4CAF50;
//                   font-weight: bold;
//                 }
//                 .footer {
//                   background-color: #f4f4f9;
//                   padding: 20px;
//                   text-align: center;
//                   font-size: 14px;
//                   color: #777777;
//                 }
//                 .footer a {
//                   color: #4CAF50;
//                   text-decoration: none;
//                 }
//                 @media only screen and (max-width: 600px) {
//                   .container {
//                     margin: 10px;
//                     padding: 10px;
//                   }
//                   .content {
//                     padding: 20px;
//                   }
//                   .content table td {
//                     display: block;
//                     width: 100%;
//                     box-sizing: border-box;
//                   }
//                   .content table td.label {
//                     width: 100%;
//                     margin-bottom: 5px;
//                   }
//                 }
//               </style>
//             </head>
//             <body>
//               <div class="container">
//                 <div class="header">
//                   <h2 style="margin: 10px 0; font-size: 20px;">A One Cafe</h2>
//                 </div>
//                 <div class="content">
//                   <h1>${emailTitle}</h1>
//                   <p>Dear <span class="highlight">${booking.user?.dataValues?.name || 'Customer'}</span>,</p>
//                   <p>${emailMessage}</p>
//                   <table>
//                     <tr>
//                       <td class="label">Booking ID</td>
//                       <td><span class="highlight">${booking.id}</span></td>
//                     </tr>
//                     <tr>
//                       <td class="label">Event</td>
//                       <td><span class="highlight">${booking.event?.dataValues?.name || 'N/A'}</span></td>
//                     </tr>
//                     <tr>
//                       <td class="label">Date</td>
//                       <td><span class="highlight">${formattedDate}</span></td>
//                     </tr>
//                     <tr>
//                       <td class="label">Venue</td>
//                       <td><span class="highlight">${booking.venue?.dataValues?.name || 'N/A'}</span></td>
//                     </tr>
//                     <tr>
//                       <td class="label">Shift</td>
//                       <td><span class="highlight">${booking.shift?.dataValues?.name || 'N/A'}</span></td>
//                     </tr>
//                     <tr>
//                       <td class="label">Guests</td>
//                       <td><span class="highlight">${booking.guest_count}</span></td>
//                     </tr>
//                     <tr>
//                       <td class="label">Package</td>
//                       <td><span class="highlight">${booking.package?.dataValues?.name || 'N/A'}</span></td>
//                     </tr>
//                     <tr>
//                       <td class="label">Phone</td>
//                       <td><span class="highlight">🇳🇵 ${displayPhone}</span></td>
//                     </tr>
//                     <tr>
//                       <td class="label">Total Fare</td>
//                       <td><span class="highlight">NPR ${booking.total_fare.toLocaleString('en-NP')}</span></td>
//                     </tr>
//                   </table>
//                   <p>${emailClosing}</p>
//                 </div>
//                 <div class="footer">
//                   <p>A One Cafe © ${new Date().getFullYear()}</p>
//                 </div>
//               </div>
//             </body>
//             </html>
//           `;

//           try {
//             console.log(`Sending email for booking ${bookingId} to ${email}, subject: ${emailSubject}`);
//             await sendEmail({
//               to: email,
//               subject: emailSubject,
//               html: emailHtml,
//             });
//             console.log(`Email sent successfully for booking ${bookingId}, status: ${normalizedStatus}`);
//           } catch (emailError) {
//             console.error(`Failed to send email for booking ${bookingId}, status: ${normalizedStatus}`, emailError);
//           }

//           // SMS for confirmed status
//           if (smsPhone !== 'N/A') {
//             const smsMessage = `A One Cafe: Your booking #${booking.id} is confirmed! Event: ${booking.event?.dataValues?.name || 'N/A'}, Date: ${formattedDate}, Venue: ${booking.venue?.dataValues?.name || 'N/A'}, NPR ${booking.total_fare.toLocaleString('en-NP')}. Contact us for queries.`;
//             try {
//               console.log(`Sending SMS for booking ${bookingId} to ${smsPhone}`);
//               await sendSMS({
//                 to: formattedPhone,
//                 message: smsMessage,
//               });
//               console.log(`SMS sent successfully for booking ${bookingId}, status: ${normalizedStatus}`);
//             } catch (smsError) {
//               console.error(`Failed to send SMS for booking ${bookingId}, status: ${normalizedStatus}`, smsError);
//             }
//           } else {
//             console.warn(`No valid phone number for SMS for booking ${bookingId}`);
//           }
//         } else if (normalizedStatus === 'cancelled') {
//           // Email for cancelled status
//           console.log(`Preparing to send cancellation email for booking ${bookingId}`);
//           const emailHtml = `
//             <!DOCTYPE html>
//             <html lang="en">
//             <head>
//               <meta charset="UTF-8">
//               <meta name="viewport" content="width=device-width, initial-scale=1.0">
//               <title>Booking Cancelled</title>
//               <style>
//                 body {
//                   font-family: 'Helvetica Neue', Arial, sans-serif;
//                   background-color: #f4f4f9;
//                   margin: 0;
//                   padding: 0;
//                   color: #333333;
//                 }
//                 .container {
//                   max-width: 600px;
//                   margin: 20px auto;
//                   background-color: #ffffff;
//                   border-radius: 8px;
//                   box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
//                   overflow: hidden;
//                 }
//                 .header {
//                   background-color: #ff4444;
//                   padding: 20px;
//                   text-align: center;
//                   color: #ffffff;
//                 }
//                 .content {
//                   padding: 30px;
//                   font-size: 16px;
//                   line-height: 1.6;
//                   color: #555555;
//                 }
//                 .content h1 {
//                   font-size: 24px;
//                   color: #333333;
//                   margin-bottom: 20px;
//                   text-align: center;
//                 }
//                 .content p {
//                   margin: 10px 0;
//                 }
//                 .content table {
//                   width: 100%;
//                   border-collapse: collapse;
//                   margin: 20px 0;
//                 }
//                 .content table td {
//                   padding: 10px;
//                   border-bottom: 1px solid #eeeeee;
//                 }
//                 .content table td.label {
//                   font-weight: bold;
//                   color: #333333;
//                   width: 40%;
//                 }
//                 .highlight {
//                   color: #ff4444;
//                   font-weight: bold;
//                 }
//                 .footer {
//                   background-color: #f4f4f9;
//                   padding: 20px;
//                   text-align: center;
//                   font-size: 14px;
//                   color: #777777;
//                 }
//                 .footer a {
//                   color: #ff4444;
//                   text-decoration: none;
//                 }
//                 @media only screen and (max-width: 600px) {
//                   .container {
//                     margin: 10px;
//                     padding: 10px;
//                   }
//                   .content {
//                     padding: 20px;
//                   }
//                   .content table td {
//                     display: block;
//                     width: 100%;
//                     box-sizing: border-box;
//                   }
//                   .content table td.label {
//                     width: 100%;
//                     margin-bottom: 5px;
//                   }
//                 }
//               </style>
//             </head>
//             <body>
//               <div class="container">
//                 <div class="header">
//                   <h2 style="margin: 10px 0; font-size: 20px;">A One Cafe</h2>
//                 </div>
//                 <div class="content">
//                   <h1>Booking Cancelled</h1>
//                   <p>Dear <span class="highlight">${booking.user?.dataValues?.name || 'Customer'}</span>,</p>
//                   <p>We regret to inform you that your booking has been cancelled. Below are the details of the cancelled booking:</p>
//                   <table>
//                     <tr>
//                       <td class="label">Booking ID</td>
//                       <td><span class="highlight">${booking.id}</span></td>
//                     </tr>
//                     <tr>
//                       <td class="label">Event</td>
//                       <td><span class="highlight">${booking.event?.dataValues?.name || 'N/A'}</span></td>
//                     </tr>
//                     <tr>
//                       <td class="label">Date</td>
//                       <td><span class="highlight">${formattedDate}</span></td>
//                     </tr>
//                     <tr>
//                       <td class="label">Venue</td>
//                       <td><span class="highlight">${booking.venue?.dataValues?.name || 'N/A'}</span></td>
//                     </tr>
//                     <tr>
//                       <td class="label">Shift</td>
//                       <td><span class="highlight">${booking.shift?.dataValues?.name || 'N/A'}</span></td>
//                     </tr>
//                     <tr>
//                       <td class="label">Guests</td>
//                       <td><span class="highlight">${booking.guest_count}</span></td>
//                     </tr>
//                     <tr>
//                       <td class="label">Package</td>
//                       <td><span class="highlight">${booking.package?.dataValues?.name || 'N/A'}</span></td>
//                     </tr>
//                     <tr>
//                       <td class="label">Phone</td>
//                       <td><span class="highlight">🇳🇵 ${displayPhone}</span></td>
//                     </tr>
//                     <tr>
//                       <td class="label">Total Fare</td>
//                       <td><span class="highlight">NPR ${booking.total_fare.toLocaleString('en-NP')}</span></td>
//                     </tr>
//                   </table>
//                   <p>We apologize for any inconvenience. Please contact our support team if you have any questions or wish to make a new booking.</p>
//                 </div>
//                 <div class="footer">
//                   <p>A One Cafe © ${new Date().getFullYear()}</p>
//                 </div>
//               </div>
//             </body>
//             </html>
//           `;

//           try {
//             console.log(`Sending cancellation email for booking ${bookingId} to ${email}`);
//             await sendEmail({
//               to: email,
//               subject: 'Your Booking Has Been Cancelled',
//               html: emailHtml,
//             });
//             console.log(`Cancellation email sent successfully for booking ${bookingId}`);
//           } catch (emailError) {
//             console.error(`Failed to send cancellation email for booking ${bookingId}`, emailError);
//           }

//           // SMS for cancelled status
//           if (smsPhone !== 'N/A') {
//             const smsMessage = `A One Cafe: Your booking #${booking.id} has been cancelled. Event: ${booking.event?.dataValues?.name || 'N/A'}, Date: ${formattedDate}. Contact us for queries.`;
//             try {
//               console.log(`Sending SMS for booking ${bookingId} to ${smsPhone}`);
//               await sendSMS({
//                 to: smsPhone,
//                 message: smsMessage,
//               });
//               console.log(`SMS sent successfully for booking ${bookingId}, status: ${normalizedStatus}`);
//             } catch (smsError) {
//               console.error(`Failed to send SMS for booking ${bookingId}, status: ${normalizedStatus}`, smsError);
//             }
//           } else {
//             console.warn(`No valid phone number for SMS for booking ${bookingId}`);
//           }
//         }
//       }

//       res.json({ message: 'Booking status updated', booking });
//     } catch (error) {
//       console.error('Error updating booking status:', error);
//       res.status(500).json({ error: 'Internal Server Error' });
//     }
//   },
// ];

// Send confirmation email
exports.sendConfirmation = async (req, res) => {
  const { bookingId, email } = req.body;
  try {
    const booking = await Booking.findByPk(bookingId, {
      include: [
        { model: Event, as: 'event' },
        { model: Venue, as: 'venue' },
        { model: Shift, as: 'shift' },
        { model: Package, as: 'package' },
        { model: User, as: 'user' },
      ],
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Use customer_phone from Booking, fallback to user.phone
    let displayPhone = booking.customer_phone || booking.user?.phone || 'N/A';
    // Format user.phone to +977 if needed
    if (displayPhone !== 'N/A' && !displayPhone.startsWith('+977') && displayPhone.length === 10) {
      displayPhone = `+977 ${displayPhone}`;
    }
    const html = `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f9;
              margin: 0;
              padding: 0;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              padding: 20px;
              background-color: #ffffff;
              border-radius: 8px;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }
            h1 {
              text-align: center;
              color: #4CAF50;
              font-size: 32px;
              margin-bottom: 20px;
            }
            .content {
              font-size: 16px;
              line-height: 1.6;
              color: #555;
            }
            .content p {
              margin: 10px 0;
            }
            .highlight {
              color: #4CAF50;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              font-size: 14px;
              color: #999;
              margin-top: 30px;
            }
            .footer a {
              color: #4CAF50;
              text-decoration: none;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Booking Confirmation</h1>
            <div class="content">
              <p>Dear <span class="highlight">${booking.user?.dataValues?.name || 'Customer'}</span>,</p>
              <p>Your booking has been successfully submitted. Below are the details:</p>
              <p><strong>Booking ID:</strong> <span class="highlight">${booking.id}</span></p>
              <p><strong>Event:</strong> <span class="highlight">${booking.event?.dataValues?.name || 'N/A'}</span></p>
              <p><strong>Date:</strong> <span class="highlight">${booking.event_date}</span></p>
              <p><strong>Venue:</strong> <span class="highlight">${booking.venue?.dataValues?.name || 'N/A'}</span></p>
              <p><strong>Shift:</strong> <span class="highlight">${booking.shift?.dataValues?.name || 'N/A'}</span></p>
              <p><strong>Guests:</strong> <span class="highlight">${booking.guest_count}</span></p>
              <p><strong>Package:</strong> <span class="highlight">${booking.package?.dataValues?.name || 'N/A'}</span></p>
              <p><strong>Phone:</strong> <span class="highlight">🇳🇵 ${displayPhone}</span></p>
              <p><strong>Total Fare:</strong> <span class="highlight">NPR ${booking.total_fare.toLocaleString('en-NP')}</span></p>
              <p>We'll contact you soon to confirm availability. If you have any questions, feel free to reach out to us.</p>
            </div>
            <div class="footer">
              <p>Thank you for choosing us!</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await sendEmail({
      to: email,
      subject: 'Booking Confirmation',
      html,
    });
    res.json({ message: 'Confirmation email sent' });
  } catch (error) {
    console.error('Error sending confirmation:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get venue details
exports.getVenueDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const venue = await Venue.findByPk(id);
    if (!venue) {
      return res.status(404).json({ message: 'Venue not found' });
    }
    res.json(venue);
  } catch (error) {
    console.error('Error fetching venue details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get shift details
exports.getShiftDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const shift = await Shift.findByPk(id);
    if (!shift) {
      return res.status(404).json({ message: 'Shift not found' });
    }
    res.json(shift);
  } catch (error) {
    console.error('Error fetching shift details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get package details
exports.getPackageDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const pkg = await Package.findByPk(id);
    if (!pkg) {
      return res.status(404).json({ message: 'Package not found' });
    }
    res.json(pkg);
  } catch (error) {
    console.error('Error fetching package details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// List all bookings
exports.listBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: [
        { model: Event, as: 'event' },
        { model: Venue, as: 'venue' },
        { model: Shift, as: 'shift' },
        { model: Package, as: 'package' },
        { model: User, as: 'user' },
      ],
    });
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Delete a booking
exports.deleteBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    await booking.destroy();
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};











// const { body, validationResult } = require('express-validator');
// const { Booking, Event, Venue, Shift, Package, User } = require('../models');
// const sendEmail = require('../utils/sendEmail');
// const sendSMS = require('../utils/sendSMS');

// Helper: Format phone number for SMS (reused from sendOTP)
const formatPhoneNumber = (phone) => {
  if (!phone) return null;
  // Remove non-digits
  let cleaned = phone.replace(/\D/g, '');
  // If 10 digits (e.g., 9841234567), assume Nepal and add +977
  if (cleaned.length === 10) {
    return `+977 ${cleaned}`;
  }
  // If already includes +977 or other country code, return as is
  if (cleaned.length > 10 && phone.startsWith('+')) {
    return phone;
  }
  // Invalid format
  return null;
};

exports.updateBookingStatus = [
  body('status').notEmpty().withMessage('Status is required'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', JSON.stringify(errors.array(), null, 2));
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { bookingId } = req.params;
      const { status } = req.body;
      // Normalize status
      const normalizedStatus = status.toLowerCase().trim();
      // Allow 'pending', 'confirmed', 'rejected', 'cancelled' statuses
      if (!['pending', 'confirmed', 'rejected', 'cancelled'].includes(normalizedStatus)) {
        console.warn(`Invalid status received: ${status}`);
        return res.status(400).json({ error: 'Status must be pending, confirmed, rejected, or cancelled' });
      }

      const booking = await Booking.findByPk(bookingId, {
        include: [
          { model: Event, as: 'event', attributes: ['name'] },
          { model: Venue, as: 'venue', attributes: ['name'] },
          { model: Shift, as: 'shift', attributes: ['name'] },
          { model: Package, as: 'package', attributes: ['name'] },
          { model: User, as: 'user', attributes: ['name', 'email', 'phone'] },
        ],
      });
      if (!booking) {
        console.error(`Booking not found for ID: ${bookingId}`);
        return res.status(404).json({ message: 'Booking not found' });
      }

      // Log booking data for debugging
      console.log('Booking data:', {
        bookingId,
        status: normalizedStatus,
        customer_phone: booking.customer_phone,
        user_phone: booking.user?.phone,
        user_email: booking.user?.email,
      });

      // Optional: Add status transition validation
      const currentStatus = booking.status.toLowerCase();
      if (currentStatus === 'cancelled' && !['pending', 'confirmed'].includes(normalizedStatus)) {
        return res.status(400).json({ error: 'Cancelled bookings can only be set to pending or confirmed' });
      }
      if (currentStatus === 'rejected' && !['pending', 'cancelled'].includes(normalizedStatus)) {
        return res.status(400).json({ error: 'Rejected bookings can only be set to pending or cancelled' });
      }

      booking.status = normalizedStatus;
      await booking.save();

      // Send notifications for confirmed or cancelled statuses
      if (['confirmed', 'cancelled'].includes(normalizedStatus)) {
        console.log(`Preparing notifications for booking ${bookingId}, status: ${normalizedStatus}`);
        const email = booking.user?.email || 'default@example.com'; // Fallback email
        // Use customer_phone from Booking, fallback to user.phone
        const phone = booking.customer_phone || booking.user?.phone;
        const smsPhone = formatPhoneNumber(phone);
        // Format phone number for email display
        const displayPhone = smsPhone ? smsPhone : 'N/A';

        console.log('Notification details:', { email, smsPhone, displayPhone });

        const formattedDate = new Date(booking.event_date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

        if (normalizedStatus === 'confirmed') {
          // Email for confirmed status
          console.log(`Preparing to send email for booking ${bookingId} to ${email}`);
          const emailTitle = 'Booking Confirmed!';
          const emailSubject = 'Your Booking is Confirmed!';
          const emailMessage = 'We are thrilled to confirm your booking. Below are the details of your event:';
          const emailClosing = 'Thank you for choosing our services! We look forward to making your event unforgettable.';

          const emailHtml = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>${emailTitle}</title>
              <style>
                body {
                  font-family: 'Helvetica Neue', Arial, sans-serif;
                  background-color: #f4f4f9;
                  margin: 0;
                  padding: 0;
                  color: #333333;
                }
                .container {
                  max-width: 600px;
                  margin: 20px auto;
                  background-color: #ffffff;
                  border-radius: 8px;
                  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                  overflow: hidden;
                }
                .header {
                  background-color: #4CAF50;
                  padding: 20px;
                  text-align: center;
                  color: #ffffff;
                }
                .content {
                  padding: 30px;
                  font-size: 16px;
                  line-height: 1.6;
                  color: #555555;
                }
                .content h1 {
                  font-size: 24px;
                  color: #333333;
                  margin-bottom: 20px;
                  text-align: center;
                }
                .content p {
                  margin: 10px 0;
                }
                .content table {
                  width: 100%;
                  border-collapse: collapse;
                  margin: 20px 0;
                }
                .content table td {
                  padding: 10px;
                  border-bottom: 1px solid #eeeeee;
                }
                .content table td.label {
                  font-weight: bold;
                  color: #333333;
                  width: 40%;
                }
                .highlight {
                  color: #4CAF50;
                  font-weight: bold;
                }
                .footer {
                  background-color: #f4f4f9;
                  padding: 20px;
                  text-align: center;
                  font-size: 14px;
                  color: #777777;
                }
                .footer a {
                  color: #4CAF50;
                  text-decoration: none;
                }
                @media only screen and (max-width: 600px) {
                  .container {
                    margin: 10px;
                    padding: 10px;
                  }
                  .content {
                    padding: 20px;
                  }
                  .content table td {
                    display: block;
                    width: 100%;
                    box-sizing: border-box;
                  }
                  .content table td.label {
                    width: 100%;
                    margin-bottom: 5px;
                  }
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h2 style="margin: 10px 0; font-size: 20px;">A One Cafe</h2>
                </div>
                <div class="content">
                  <h1>${emailTitle}</h1>
                  <p>Dear <span class="highlight">${booking.user?.name || 'Customer'}</span>,</p>
                  <p>${emailMessage}</p>
                  <table>
                    <tr>
                      <td class="label">Booking ID</td>
                      <td><span class="highlight">${booking.id}</span></td>
                    </tr>
                    <tr>
                      <td class="label">Event</td>
                      <td><span class="highlight">${booking.event?.name || 'N/A'}</span></td>
                    </tr>
                    <tr>
                      <td class="label">Date</td>
                      <td><span class="highlight">${formattedDate}</span></td>
                    </tr>
                    <tr>
                      <td class="label">Venue</td>
                      <td><span class="highlight">${booking.venue?.name || 'N/A'}</span></td>
                    </tr>
                    <tr>
                      <td class="label">Shift</td>
                      <td><span class="highlight">${booking.shift?.name || 'N/A'}</span></td>
                    </tr>
                    <tr>
                      <td class="label">Guests</td>
                      <td><span class="highlight">${booking.guest_count}</span></td>
                    </tr>
                    <tr>
                      <td class="label">Package</td>
                      <td><span class="highlight">${booking.package?.name || 'N/A'}</span></td>
                    </tr>
                    <tr>
                      <td class="label">Phone</td>
                      <td><span class="highlight">🇳🇵 ${displayPhone}</span></td>
                    </tr>
                    <tr>
                      <td class="label">Total Fare</td>
                      <td><span class="highlight">NPR ${booking.total_fare.toLocaleString('en-NP')}</span></td>
                    </tr>
                  </table>
                  <p>${emailClosing}</p>
                </div>
                <div class="footer">
                  <p>EventEase © ${new Date().getFullYear()}</p>
                </div>
              </div>
            </body>
            </html>
          `;

          try {
            console.log(`Sending email for booking ${bookingId} to ${email}, subject: ${emailSubject}`);
            await sendEmail({
              to: email,
              subject: emailSubject,
              html: emailHtml,
            });
            console.log(`Email sent successfully for booking ${bookingId}, status: ${normalizedStatus}`);
          } catch (emailError) {
            console.error(`Failed to send email for booking ${bookingId}, status: ${normalizedStatus}`, emailError);
          }

          // SMS for confirmed status
          if (smsPhone) {
            const smsText = `EventEase: Booking #${booking.id} confirmed! Event: ${booking.event?.name || 'N/A'}, Date: ${formattedDate}, Venue: ${booking.venue?.name || 'N/A'}. Contact us for queries.`;
            console.log('SMS content:', { to: smsPhone, text: smsText });
            try {
              console.log(`Sending SMS for booking ${bookingId} to ${smsPhone}`);
              await sendSMS({
                to: smsPhone,
                text: smsText,
              });
              console.log(`SMS sent successfully for booking ${bookingId}, status: ${normalizedStatus}`);
            } catch (smsError) {
              console.error(`Failed to send SMS for booking ${bookingId}, status: ${normalizedStatus}`, smsError);
            }
          } else {
            console.warn(`No valid phone number for SMS for booking ${bookingId}`);
          }
        } else if (normalizedStatus === 'cancelled') {
          // Email for cancelled status
          console.log(`Preparing to send cancellation email for booking ${bookingId}`);
          const emailHtml = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Booking Cancelled</title>
              <style>
                body {
                  font-family: 'Helvetica Neue', Arial, sans-serif;
                  background-color: #f4f4f9;
                  margin: 0;
                  padding: 0;
                  color: #333333;
                }
                .container {
                  max-width: 600px;
                  margin: 20px auto;
                  background-color: #ffffff;
                  border-radius: 8px;
                  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                  overflow: hidden;
                }
                .header {
                  background-color: #ff4444;
                  padding: 20px;
                  text-align: center;
                  color: #ffffff;
                }
                .content {
                  padding: 30px;
                  font-size: 16px;
                  line-height: 1.6;
                  color: #555555;
                }
                .content h1 {
                  font-size: 24px;
                  color: #333333;
                  margin-bottom: 20px;
                  text-align: center;
                }
                .content p {
                  margin: 10px 0;
                }
                .content table {
                  width: 100%;
                  border-collapse: collapse;
                  margin: 20px 0;
                }
                .content table td {
                  padding: 10px;
                  border-bottom: 1px solid #eeeeee;
                }
                .content table td.label {
                  font-weight: bold;
                  color: #333333;
                  width: 40%;
                }
                .highlight {
                  color: #ff4444;
                  font-weight: bold;
                }
                .footer {
                  background-color: #f4f4f9;
                  padding: 20px;
                  text-align: center;
                  font-size: 14px;
                  color: #777777;
                }
                .footer a {
                  color: #ff4444;
                  text-decoration: none;
                }
                @media only screen and (max-width: 600px) {
                  .container {
                    margin: 10px;
                    padding: 10px;
                  }
                  .content {
                    padding: 20px;
                  }
                  .content table td {
                    display: block;
                    width: 100%;
                    box-sizing: border-box;
                  }
                  .content table td.label {
                    width: 100%;
                    margin-bottom: 5px;
                  }
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h2 style="margin: 10px 0; font-size: 20px;">EventEase</h2>
                </div>
                <div class="content">
                  <h1>Booking Cancelled</h1>
                  <p>Dear <span class="highlight">${booking.user?.name || 'Customer'}</span>,</p>
                  <p>We regret to inform you that your booking has been cancelled. Below are the details of the cancelled booking:</p>
                  <table>
                    <tr>
                      <td class="label">Booking ID</td>
                      <td><span class="highlight">${booking.id}</span></td>
                    </tr>
                    <tr>
                      <td class="label">Event</td>
                      <td><span class="highlight">${booking.event?.name || 'N/A'}</span></td>
                    </tr>
                    <tr>
                      <td class="label">Date</td>
                      <td><span class="highlight">${formattedDate}</span></td>
                    </tr>
                    <tr>
                      <td class="label">Venue</td>
                      <td><span class="highlight">${booking.venue?.name || 'N/A'}</span></td>
                    </tr>
                    <tr>
                      <td class="label">Shift</td>
                      <td><span class="highlight">${booking.shift?.name || 'N/A'}</span></td>
                    </tr>
                    <tr>
                      <td class="label">Guests</td>
                      <td><span class="highlight">${booking.guest_count}</span></td>
                    </tr>
                    <tr>
                      <td class="label">Package</td>
                      <td><span class="highlight">${booking.package?.name || 'N/A'}</span></td>
                    </tr>
                    <tr>
                      <td class="label">Phone</td>
                      <td><span class="highlight">🇳🇵 ${displayPhone}</span></td>
                    </tr>
                    <tr>
                      <td class="label">Total Fare</td>
                      <td><span class="highlight">NPR ${booking.total_fare.toLocaleString('en-NP')}</span></td>
                    </tr>
                  </table>
                  <p>We apologize for any inconvenience. Please contact our support team if you have any questions or wish to make a new booking.</p>
                </div>
                <div class="footer">
                  <p>EventEase © ${new Date().getFullYear()}</p>
                </div>
              </div>
            </body>
            </html>
          `;

          try {
            console.log(`Sending cancellation email for booking ${bookingId} to ${email}`);
            await sendEmail({
              to: email,
              subject: 'Your Booking Has Been Cancelled',
              html: emailHtml,
            });
            console.log(`Cancellation email sent successfully for booking ${bookingId}`);
          } catch (emailError) {
            console.error(`Failed to send cancellation email for booking ${bookingId}`, emailError);
          }

          // SMS for cancelled status
          if (smsPhone) {
            const smsText = `EventEase: Booking #${booking.id} cancelled. Event: ${booking.event?.name || 'N/A'}, Date: ${formattedDate}. Contact us for queries.`;
            console.log('SMS content:', { to: smsPhone, text: smsText });
            try {
              console.log(`Sending SMS for booking ${bookingId} to ${smsPhone}`);
              await sendSMS({
                to: smsPhone,
                text: smsText,
              });
              console.log(`SMS sent successfully for booking ${bookingId}, status: ${normalizedStatus}`);
            } catch (smsError) {
              console.error(`Failed to send SMS for booking ${bookingId}, status: ${normalizedStatus}`, smsError);
            }
          } else {
            console.warn(`No valid phone number for SMS for booking ${bookingId}`);
          }
        }
      }

      res.json({ message: 'Booking status updated', booking });
    } catch (error) {
      console.error('Error updating booking status:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
];