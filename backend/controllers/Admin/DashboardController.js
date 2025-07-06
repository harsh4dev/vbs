// controllers/dashboardController.js
const { Event, Venue, Shift, Package, Menu, Booking, User } = require('../../models'); // Import from models/index.js

// Get dashboard data with counts of all entities
exports.getDashboardData = async (req, res) => {
    try {
        const [
            eventsCount,
            venuesCount,
            shiftsCount,
            packagesCount,
            menusCount,
            bookingsCount,
            usersCount
        ] = await Promise.all([
            Event.count(),
            Venue.count(),
            Shift.count(),
            Package.count(),
            Menu.count(),
            Booking.count(),
            User.count()
        ]);

        res.json({
            eventsCount,
            venuesCount,
            shiftsCount,
            packagesCount,
            menusCount,
            bookingsCount,
            usersCount
        });
    } catch (error) {
        console.error('Dashboard Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = exports;