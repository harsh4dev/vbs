const Sequelize = require('sequelize');
const sequelize = require('../config/db');

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Load all models using function-based definitions
db.User = require('./users')(sequelize, Sequelize.DataTypes);
db.Admin = require('./admin')(sequelize, Sequelize.DataTypes);
db.Event = require('./event')(sequelize, Sequelize.DataTypes);
db.Venue = require('./venue')(sequelize, Sequelize.DataTypes);
db.Shift = require('./shift')(sequelize, Sequelize.DataTypes);
db.Package = require('./package')(sequelize, Sequelize.DataTypes);
db.Menu = require('./menu')(sequelize, Sequelize.DataTypes);
db.Booking = require('./booking')(sequelize, Sequelize.DataTypes);
db.Otp = require('./otp')(sequelize, Sequelize.DataTypes);
// If any associations (e.g., belongsTo, hasMany), define them here
// Object.values(db).forEach(model => {
//   if (model.associate) {
//     model.associate(db);
//   }
// });



Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db); // <- this must run
  }
});



module.exports = db;
