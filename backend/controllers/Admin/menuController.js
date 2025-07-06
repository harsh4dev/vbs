const db = require('../../models');
const Menu = db.Menu;
const Package = db.Package;

exports.displayMenus = async (req, res) => {
  try {
   const menus = await db.Menu.findAll({
  include: [{
    model: db.Package,
    as: 'package'
  }]
});
    res.json(menus);
  } catch (err) {
      console.error('Full error:', err);
    console.error('Error fetching menus:', err.message);
    
    res.status(500).json({ error: 'Error fetching menus', details: err.message,err });
  }
};





// exports.displayMenus = async (req, res) => {
//   try {
//     const menus = await Menu.findAll({
//       include: [{ model: Package, as: 'package', required: false }], // Use LEFT JOIN to avoid errors
//     });
//     res.json(menus);
//   } catch (err) {
//     console.error('Error fetching menus:', err.message, err.stack);
//     res.status(500).json({ error: 'Error fetching menus', details: err.message });
//   }
// };



exports.createMenu = async (req, res) => {
  try {
    const { package_id, name, items, free_limit } = req.body;

    if (!package_id || !name || !Array.isArray(items) || typeof free_limit !== 'number') {
      return res.status(400).json({ error: 'All fields are required and must be valid' });
    }

    // Validate items format: [{ name: string, price: number }, ...]
    if (!items.every(item => typeof item === 'object' && item.name && typeof item.price === 'number' && item.price >= 0)) {
      return res.status(400).json({ error: 'Items must be an array of objects with name and non-negative price' });
    }

    const pkg = await Package.findByPk(package_id);
    if (!pkg) {
      return res.status(400).json({ error: 'Invalid package_id. Package does not exist.' });
    }

    const newMenu = await Menu.create({
      package_id,
      name,
      items,
      free_limit
    });

    res.status(201).json({ message: 'Menu created successfully', menu: newMenu });
  } catch (err) {
    console.error('Error creating menu:', err);
    res.status(500).json({ error: 'Error creating menu' });
  }
};

exports.updateMenu = async (req, res) => {
  try {
    const { name, items, free_limit } = req.body;
    const { package_id, id: menu_id } = req.params;
    const updateFields = {};

    if (package_id) {
      const pkg = await Package.findByPk(package_id);
      if (!pkg) {
        return res.status(400).json({ error: 'Invalid package_id. Package does not exist.' });
      }
      updateFields.package_id = package_id;
    }

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ error: 'Invalid name' });
      }
      updateFields.name = name;
    }

    if (items !== undefined) {
      if (!Array.isArray(items) || !items.every(item => typeof item === 'object' && item.name && typeof item.price === 'number' && item.price >= 0)) {
        return res.status(400).json({ error: 'Items must be an array of objects with name and non-negative price' });
      }
      updateFields.items = items;
    }

    if (free_limit !== undefined) {
      if (typeof free_limit !== 'number' || free_limit < 0) {
        return res.status(400).json({ error: 'Free limit must be a non-negative number' });
      }
      updateFields.free_limit = free_limit;
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ error: 'At least one valid field is required to update' });
    }

    const [updated] = await Menu.update(updateFields, {
      where: { id: menu_id },
    });

    if (!updated) {
      return res.status(404).json({ error: 'Menu not found or no changes applied' });
    }

    res.json({ message: 'Menu updated successfully' });
  } catch (err) {
    console.error('Error updating menu:', err);
    res.status(500).json({ error: 'Error updating menu' });
  }
};

exports.deleteMenu = async (req, res) => {
  try {
    const menuId = req.params.id;
    const menu = await Menu.findByPk(menuId);
    if (!menu) {
      return res.status(404).json({ error: 'Menu not found' });
    }

    // Check if any bookings reference this menu
    const bookings = await db.Booking.findAll({
      where: {
        selected_menus: {
          [menuId]: db.Sequelize.literal(`selected_menus->>'${menuId}' IS NOT NULL`)
        }
      }
    });

    if (bookings.length > 0) {
      return res.status(400).json({ error: 'Cannot delete menu; it is referenced by existing bookings' });
    }

    await menu.destroy();
    res.json({ message: 'Menu deleted successfully' });
  } catch (err) {
    console.error('Error deleting menu:', err);
    res.status(500).json({ error: 'Error deleting menu' });
  }
};

exports.getMenuById = async (req, res) => {
  try {
    const menuId = req.params.id;

    const menu = await Menu.findByPk(menuId, {
      include: [{ model: Package, as: 'package' }]
    });

    if (!menu) {
      return res.status(404).json({ error: 'Menu not found' });
    }

    res.json(menu);
  } catch (err) {
    console.error('Error fetching menu by ID:', err);
    res.status(500).json({ error: 'Error fetching menu' });
  }
};

exports.getMenuByPackageId = async (req, res) => {
  try {
    const packageId = req.params.package_id;

    const menus = await Menu.findAll({
      where: { package_id: packageId },
      include: [{ model: Package, as: 'package' }]
    });

    if (menus.length === 0) {
      return res.status(404).json({ error: 'No menus found for the specified package' });
    }

    res.json(menus);
  } catch (err) {
    console.error('Error fetching menus by package ID:', err);
    res.status(500).json({ error: 'Error fetching menus by package ID' });
  }
};