// controllers/eventController.js
const { Event } = require('../../models'); // Import from models/index.js

// List all events
exports.listEvents = async (req, res) => {
    try {
        const events = await Event.findAll();
        res.status(200).json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

// Create a new event
exports.createEvent = async (req, res) => {
    try {
        const { name } = req.body;
        const newEvent = await Event.create({ name });
        res.status(201).json({ success: true, event: newEvent });
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Update an existing event
exports.updateEvent = async (req, res) => {
    try {
        const { name } = req.body;
        const event = await Event.findByPk(req.params.id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (!name) {
            return res.status(400).json({ message: 'Event name is required' });
        }

        event.name = name;
        await event.save();
        res.status(200).json(event);
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Delete an event
exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findByPk(req.params.id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        await event.destroy();
        res.status(200).json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = exports;