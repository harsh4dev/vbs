const { Admin } = require('../../models');
const { Op } = require('sequelize');

// GET /api/user/:id - Fetch user data by ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate the ID
    if (!id || isNaN(id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const user = await Admin.findByPk(id, {
      attributes: ['id', 'name', 'email'], // Explicitly select only defined columns
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// PUT /api/user/:id - Update user profile by ID
exports.updateProfile = async (req, res) => {
  const { name, email } = req.body;
  const userId = req.params.id;

  // Manual validation
  const errors = [];

  if (name !== undefined && name.trim() === '') {
    errors.push({ field: 'name', message: 'Name cannot be empty' });
  }

  if (email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push({ field: 'email', message: 'Valid email is required' });
  }

  if (errors.length > 0) {
    return res.status(422).json({ errors });
  }

  try {
    const user = await Admin.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check email uniqueness only if email is changing
    if (email && email !== user.email) {
      const existingEmail = await Admin.findOne({
        where: {
          email,
          id: { [Op.ne]: userId },
        },
      });

      if (existingEmail) {
        return res.status(409).json({ message: 'Email already taken' });
      }
    }

    // Update only provided fields
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;

    await user.save();

    return res.json({
      message: 'Profile updated successfully.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Update user error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};