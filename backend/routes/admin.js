const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

// Import Controllers
const AuthController = require('../controllers/Admin/adminAuthController');
const eventController = require('../controllers/Admin/eventController');
const venueController = require('../controllers/Admin/venueController');
const AdminProfileController = require('../controllers/Admin/adminProfileController');
const bookingController = require('../controllers/Admin/bookingController');
const menuController = require('../controllers/Admin/menuController');
const packageController = require('../controllers/Admin/packageController');
const shiftController = require('../controllers/Admin/shiftController');
const dashboardController = require('../controllers/Admin/DashboardController');
const userontroller = require('../controllers/Admin/userController');
// Get dashboard data
router.get('/dashboard', dashboardController.getDashboardData);

// Venue Routes
router.get('/venues', venueController.getAllVenues);
router.post('/venues/create', venueController.createVenue);
router.put('/venues/update/:id', venueController.updateVenue);
router.delete('/venues/delete/:id', venueController.deleteVenue);
// router.get('/venues/:id', bookingController.getVenueDetails);

// Event Routes
router.get('/events', eventController.listEvents);
// router.get('/events/:id', eventController.getEventById);
router.post('/events/create', eventController.createEvent);
router.put('/events/edit/:id', eventController.updateEvent);
router.delete('/events/delete/:id', eventController.deleteEvent);

// Booking Flow Routes (Admin API)
router.get('/bookings/initiate', bookingController.initiateBooking);
router.get('/bookings/:user_id', bookingController.getBookingsByUserId);

router.post(
  '/bookings/check-date',
  [
    body('event_date').isDate().withMessage('Invalid date'),
    
  ],
  bookingController.checkDate
);
router.post(
  '/bookings/check-availability',
  [
    body('event_id').notEmpty().withMessage('Event is required'),
    body('venue_id').notEmpty().withMessage('Venue is required'),
    body('shift_id').notEmpty().withMessage('Shift is required'),
    body('event_date').isDate().withMessage('Event date is required'),
    body('guest_count').isInt({ min: 1 }).withMessage('Guest count must be a number'),
   
  ],
  bookingController.checkBookingAvailability
);
router.get('/bookings/select-package', bookingController.selectPackage);
router.get('/bookings/package/:packageId/menus', bookingController.getPackageMenus);
router.post(
  '/bookings/calculate-fare',
  [
    body('package_id').isInt().withMessage('Invalid package ID'),
    body('guest_count').isInt({ min: 10 }).withMessage('Invalid guest count'),
    body('selected_menus').isObject().withMessage('Invalid menu selections'),
    
  ],
  bookingController.calculateFare
);
router.post('/bookings/store', bookingController.storeBooking);
router.post('/bookings/send-confirmation', bookingController.sendConfirmation);
router.get('/bookings/shift/:id', bookingController.getShiftDetails);
router.get('/bookings/package/:id', bookingController.getPackageDetails);
router.get('/bookings', bookingController.listBookings);
router.patch(
  '/bookings/:bookingId/status',
  [body('status').notEmpty().withMessage('Status is required')],
  bookingController.updateBookingStatus
);
router.delete('/bookings/:bookingId', bookingController.deleteBooking);

// Menu Routes
router.get('/menu', menuController.displayMenus);
router.get('/menu/:id', menuController.getMenuById);
router.post('/menu/create', menuController.createMenu);
router.put('/menu/:package_id/:id', menuController.updateMenu);
router.delete('/menu/delete/:id', menuController.deleteMenu);
router.get('/menus/package/:package_id', menuController.getMenuByPackageId);
router.get('/menus/:id', menuController.getMenuById);

// Package Routes
router.get('/package', packageController.listPackages);
router.post('/package/create', packageController.createPackage);
router.put('/package/update/:id', packageController.updatePackage);
router.delete('/package/delete/:id', packageController.deletePackage);
router.get('/package/:id/menus', packageController.getPackageMenus);

// Shift Routes
router.get('/shift', shiftController.listShifts);
router.post('/shift/create', shiftController.createShift);
router.put('/shift/update/:id', shiftController.updateShift);
router.delete('/shift/delete/:id', shiftController.deleteShift);

// User Routes
router.get('/users', userontroller.getAllUsers);
router.post('/users/create', userontroller.createUser);
router.get('/:id', AdminProfileController.getUserById);
// router.put('/users/:id', AdminProfileController.updateProfile);
router.put('/users/:id', userontroller.updateUser);
router.delete('/users/:id', userontroller.deleteUser);
// router.delete('/users/:id', AdminProfileController.deleteUser);


// Authentication Routes
router.post('/signup', AuthController.signup);
router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);
router.put('/update/:id', AuthController.updateAdmin);

router.post('/forgot-password', AuthController.forgotPassword);
router.get('/reset-password/:token', AuthController.renderAdminResetPassword);
router.post('/reset-password/:token', AuthController.resetAdminPassword);


module.exports = router;