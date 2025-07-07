'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Fetch all menus
    const menus = await queryInterface.sequelize.query(
      'SELECT id, items FROM menus',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // Update each menu's items to include price
    for (const menu of menus) {
      let items = menu.items;
      // If items is an array of strings, convert to array of objects
      if (Array.isArray(items) && items.length > 0 && typeof items[0] === 'string') {
        items = items.map(item => ({ name: item, price: 10 }));
      } else if (Array.isArray(items)) {
        // Ensure all items have price
        items = items.map(item => ({
          name: item.name || item,
          price: item.price != null ? item.price : 10
        }));
      } else {
        items = [];
      }

      // Update the menu
      await queryInterface.sequelize.query(
        'UPDATE menus SET items = :items WHERE id = :id',
        {
          replacements: { id: menu.id, items: JSON.stringify(items) },
          type: queryInterface.sequelize.QueryTypes.UPDATE
        }
      );
    }
  },

  async down(queryInterface, Sequelize) {
    // Remove price from items, revert to array of strings
    const menus = await queryInterface.sequelize.query(
      'SELECT id, items FROM menus',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    for (const menu of menus) {
      const items = menu.items.map(item => item.name);
      await queryInterface.sequelize.query(
        'UPDATE menus SET items = :items WHERE id = :id',
        {
          replacements: { id: menu.id, items: JSON.stringify(items) },
          type: queryInterface.sequelize.QueryTypes.UPDATE
        }
      );
    }
  }
};