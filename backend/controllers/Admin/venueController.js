const { Venue } = require('../../models'); // Sequelize model for Venue
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'public/venues/';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}${path.extname(file.originalname)}`);
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png|gif/;
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = fileTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Only images (jpeg, jpg, png, gif) are allowed'));
        }
    },
}).single('image');

// // Display all venues
// // controllers/adminController.js
// exports.getAllVenues = async (req, res) => {
//   try {
//     const { page = 1, limit = 10 } = req.query;
//     const offset = (page - 1) * limit;

//     const { count, rows: venues } = await Venue.findAndCountAll({
//       limit: parseInt(limit),
//       offset: parseInt(offset),
//     });

//     res.json({
//       venues,
//       total: count,
//       page: parseInt(page),
//       limit: parseInt(limit),
//       totalPages: Math.ceil(count / limit),
//     });
//   } catch (error) {
//     console.error('Error fetching venues:', error);
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// };



exports.getAllVenues = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const { count, rows: venues } = await Venue.findAndCountAll({
            limit: parseInt(limit),
            offset: parseInt(offset),
        });

        // Append full image URL to each venue
        const venuesWithFullImageUrl = venues.map(venue => ({
            ...venue.toJSON(),
            image: venue.image
                ? `https://noded.harshchaudhary.com.np/${venue.image}`
                : 'https://noded.harshchaudhary.com.np/default_venue.jpg',
        }));

        res.json({
            venues: venuesWithFullImageUrl,
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(count / limit),
        });
    } catch (error) {
        console.error('Error fetching venues:', error);
        res.status(500).json({ message: 'Failed to fetch venues', error: error.message });
    }
};


// Create a new venue
exports.createVenue = [upload, async (req, res) => {
    try {
        const { name, capacity } = req.body;

        if (!name || !capacity || !req.file) {
            return res.status(400).send('Invalid input data');
        }

        const imagePath = req.file.path.replace('public/', ''); // Store the path relative to 'public'

        const newVenue = await Venue.create({
            name,
            capacity,
            image: imagePath,
        });

        res.status(201).json({ message: 'Venue created successfully', venue: newVenue });
    } catch (err) {
        res.status(500).send('Error creating venue');
    }
}];

// Update a venue's name, capacity, and image
// exports.updateVenue = [upload, async (req, res) => {
//     try {
//         const venue = await Venue.findByPk(req.params.id);
//         if (!venue) {
//             return res.status(404).send('Venue not found');
//         }

//         const { name, capacity } = req.body;
//         const updatedData = {};

//         if (name) updatedData.name = name;
//         if (capacity) updatedData.capacity = capacity;

//         if (req.file) {
//             if (venue.image && fs.existsSync('public/' + venue.image)) {
//                 fs.unlinkSync('public/' + venue.image); // Delete old image
//             }
//             updatedData.image = req.file.path.replace('public/', ''); // Add new image
//         }

//         const updatedVenue = await venue.update(updatedData);

//         res.json({ message: 'Venue updated successfully', venue: updatedVenue });
//     } catch (err) {
//         res.status(500).send('Error updating venue');
//     }
// }];




// Update a venue
exports.updateVenue = [upload, async (req, res) => {
    try {
        console.log('Update request body:', req.body); // Debug: Log request body
        console.log('Update request file:', req.file); // Debug: Log file details

        const venue = await Venue.findByPk(req.params.id);
        if (!venue) {
            return res.status(404).json({ message: 'Venue not found' });
        }

        const { name, capacity } = req.body;
        const updatedData = {};

        if (name) updatedData.name = name;
        if (capacity) updatedData.capacity = parseInt(capacity);

        if (req.file) {
            console.log('New image uploaded:', req.file); // Debug: Confirm file received
            // Delete old image if it exists
            if (venue.image && fs.existsSync(path.join('public', venue.image))) {
                console.log('Deleting old image:', path.join('public', venue.image)); // Debug: Confirm deletion
                fs.unlinkSync(path.join('public', venue.image));
            }
            updatedData.image = req.file.path.replace('public' + path.sep, '');
            console.log('New image path saved:', updatedData.image); // Debug: Confirm new path
        } else {
            console.log('No new image provided for update'); // Debug: No file uploaded
        }

        const updatedVenue = await venue.update(updatedData);

        // Return full image URL
        updatedVenue.image = updatedVenue.image
            ? `https://noded.harshchaudhary.com.np/${updatedVenue.image}`
            : 'https://noded.harshchaudhary.com.np/default_venue.jpg';

        res.json({ message: 'Venue updated successfully', venue: updatedVenue });
    } catch (err) {
        console.error('Error updating venue:', err);
        res.status(500).json({ message: 'Failed to update venue', error: err.message });
    }
}];









// Delete a venue
exports.deleteVenue = async (req, res) => {
    try {
        const venue = await Venue.findByPk(req.params.id);
        if (!venue) {
            return res.status(404).send('Venue not found');
        }

        // Delete the venue image if it exists
        if (venue.image && fs.existsSync('public/' + venue.image)) {
            fs.unlinkSync('public/' + venue.image);
        }

        await venue.destroy(); // Delete the venue record

        res.json({ message: 'Venue deleted successfully' });
    } catch (err) {
        res.status(500).send('Error deleting venue');
    }
};
