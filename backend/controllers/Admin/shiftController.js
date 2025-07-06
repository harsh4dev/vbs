// controllers/shiftController.js
const { Shift } = require('../../models'); 

// List all shifts
exports.listShifts = async (req, res) => {
    try {
        const shifts = await Shift.findAll();
        res.json(shifts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching shifts' });
    }
};

// Create a new shift
exports.createShift = async (req, res) => {
    try {
        const { name } = req.body;

        // Validation
        if (!name || name.trim().length === 0) {
            return res.status(400).json({ error: 'Shift name is required' });
        }

        const newShift = await Shift.create({ name });
        res.status(201).json({ message: 'Shift created successfully', shift: newShift });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error creating shift' });
    }
};

// Update a shift
exports.updateShift = async (req, res) => {
    try {
        const { name } = req.body;

        // Validation
        if (!name || name.trim().length === 0) {
            return res.status(400).json({ error: 'Shift name is required' });
        }

        const [updated] = await Shift.update(
            { name },
            { where: { id: req.params.id } }
        );

        if (!updated) {
            return res.status(404).json({ error: 'Shift not found' });
        }

        res.json({ message: 'Shift updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error updating shift' });
    }
};

// Delete a shift
exports.deleteShift = async (req, res) => {
    try {
        const deleted = await Shift.destroy({ where: { id: req.params.id } });

        if (!deleted) {
            return res.status(404).json({ error: 'Shift not found' });
        }

        res.json({ message: 'Shift deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error deleting shift' });
    }
};

module.exports = exports;