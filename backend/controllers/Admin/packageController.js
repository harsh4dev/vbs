// controllers/packageController.js
const { Package, Menu } = require('../../models'); // Import from models/index.js

// List all packages
exports.listPackages = async (req, res) => {
    try {
        const packages = await Package.findAll();
        res.json(packages);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching packages' });
    }
};

// Create a new package
exports.createPackage = async (req, res) => {
    try {
        const { name, base_price } = req.body;

        // Validation
        if (!name || !base_price || isNaN(base_price) || base_price < 0) {
            return res.status(400).json({ error: 'Name and base price are required and must be valid' });
        }

        const newPackage = await Package.create({ name, base_price });
        res.status(201).json({ message: 'Package created successfully', package: newPackage });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error creating package' });
    }
};

// Update a package
exports.updatePackage = async (req, res) => {
    try {
        const { name, base_price } = req.body;

        // Validation
        if (!name || !base_price || isNaN(base_price) || base_price < 0) {
            return res.status(400).json({ error: 'Name and base price are required and must be valid' });
        }

        const [updated] = await Package.update(
            { name, base_price },
            { where: { id: req.params.id } }
        );

        if (!updated) {
            return res.status(404).json({ error: 'Package not found' });
        }

        res.json({ message: 'Package updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error updating package' });
    }
};

// Delete a package
exports.deletePackage = async (req, res) => {
    try {
        const deleted = await Package.destroy({ where: { id: req.params.id } });

        if (!deleted) {
            return res.status(404).json({ error: 'Package not found' });
        }

        res.json({ message: 'Package deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error deleting package' });
    }
};

// Get menus associated with a package
exports.getPackageMenus = async (req, res) => {
    try {
        const package = await Package.findOne({
            where: { id: req.params.id },
            include: [{ model: Menu, as: 'menus' }]
        });

        if (!package) {
            return res.status(404).json({ error: 'Package not found' });
        }

        res.json(package.menus);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching menus' });
    }
};

module.exports = exports;