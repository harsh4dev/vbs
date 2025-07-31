// models/venue.js

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Venue = sequelize.define('Venue', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    image: {
      type: DataTypes.STRING
    },
    capacity: {
      type: DataTypes.INTEGER
    }
  }, {
    tableName: 'venues',
    timestamps: true
  });

  return Venue;
};
