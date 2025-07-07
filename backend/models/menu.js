const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Menu = sequelize.define('Menu', {
    package_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
items: {
  type: DataTypes.JSON,
  allowNull: false,
  defaultValue: [],
  get() {
    let raw = this.getDataValue('items');
    if (!raw) return [];

    // If string (sometimes JSON stored as string), parse it
    if (typeof raw === 'string') {
      try {
        raw = JSON.parse(raw);
      } catch (err) {
        return [];
      }
    }

    if (!Array.isArray(raw)) return [];

    return raw.map(item => ({
      name: typeof item === 'object' ? item.name : item,
      price: typeof item === 'object' && item.price != null ? item.price : 10
    }));
  }
}

,
    free_limit: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    tableName: 'menus',
    timestamps: true
  });

  Menu.associate = (models) => {
    Menu.belongsTo(models.Package, {
      foreignKey: 'package_id',
      as: 'package',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  };

  return Menu;
};