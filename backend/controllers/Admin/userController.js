const bcrypt = require('bcrypt');
const { User, Sequelize } = require('../../models');
const { generateToken } = require('../../utils/token');
const sendEmail = require('../../utils/sendEmail');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'name', 'email', 'phone'], // Added phone
        });
        res.status(200).json(users);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: 'Error fetching users' });
    }
};

exports.createUser = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        // Validate required fields
        if (!name || !email || !password || !phone) {
            return res.status(400).json({ message: 'Name, email, password, and phone are required.' });
        }

        // Validate phone format (10 digits)
        if (!/^\d{10}$/.test(phone)) {
            return res.status(400).json({ message: 'Phone number must be exactly 10 digits.' });
        }

        // Check for existing email or phone
        const existing = await User.findOne({
            where: {
                [Sequelize.Op.or]: [{ email }, { phone }],
            },
        });
        if (existing) {
            return res.status(400).json({
                message: existing.email === email ? 'Email already registered' : 'Phone number already registered',
            });
        }

        const { raw, hash } = generateToken();
        const expires = new Date(Date.now() + 1000 * 60 * 60);

        const user = await User.create({
            name,
            email,
            password,
            phone,
            verification_token: hash,
            verification_token_expires: expires,
        });

        const link = `${req.protocol}://${req.get('host')}/api/verify-email?token=${raw}&email=${encodeURIComponent(email)}`;
        await sendEmail({
            to: email,
            subject: 'Verify your email',
            html: `<p>Click to verify your email:</p><a href="${link}">${link}</a>`,
        });

        res.status(201).json({ message: 'User added successfully. Please check your email to verify your account.' });
    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ message: 'Internal server error during signup.' });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { name, email, phone } = req.body;

        // Validate required fields
        if (!name || !email) {
            return res.status(400).send('Name and email are required');
        }

        // Validate phone if provided
        if (phone && !/^\d{10}$/.test(phone)) {
            return res.status(400).json({ message: 'Phone number must be exactly 10 digits.' });
        }

        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Check for email or phone conflicts
        const conflicts = await User.findOne({
            where: {
                [Sequelize.Op.or]: [
                    { email, id: { [Sequelize.Op.ne]: req.params.id } },
                    phone ? { phone, id: { [Sequelize.Op.ne]: req.params.id } } : null,
                ].filter(Boolean),
            },
        });

        if (conflicts) {
            return res.status(400).send(
                conflicts.email === email ? 'Email already exists' : 'Phone number already exists'
            );
        }

        const updateData = { name, email };
        if (phone) updateData.phone = phone;

        await user.update(updateData);
        res.status(201).json({ message: 'User updated' });
    } catch (err) {
        console.error('Update user error:', err);
        res.status(500).send('Error updating user');
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).send('User not found');
        }

        await user.destroy();
        res.status(201).json({ message: 'User deleted successfully.' });
    } catch (err) {
        console.error('Delete user error:', err);
        res.status(500).send('Error deleting user');
    }
};