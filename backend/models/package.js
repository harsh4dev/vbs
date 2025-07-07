// models/package.js

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Package = sequelize.define('Package', {
    name: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    base_price: {
      type: DataTypes.FLOAT,
      allowNull: false
    }
  }, {
    tableName: 'packages',
    timestamps: true
  });

  Package.associate = (models) => {
    Package.hasMany(models.Menu, {
      foreignKey: 'package_id',
      as: 'menus'
    });
  };

  return Package;
};
