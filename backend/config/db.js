// db.js

const { Sequelize } = require('sequelize');
const logger = require('../logs/logger');
// Set up a connection to the database
const sequelize = new Sequelize('harshchaudhary_venue_booking_system', 'harshchaudhary_harshchaudhary', 'venue@555', {
  host: 'localhost',
  dialect: 'mysql',
  logging: (msg) => logger.info(msg), 
});




module.exports = sequelize;
