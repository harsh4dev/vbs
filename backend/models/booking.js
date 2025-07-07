// const { DataTypes } = require('sequelize');

// module.exports = (sequelize) => {
//   const Booking = sequelize.define('Booking', {
//     user_id: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       references: { model: 'users', key: 'id' }
//     },
//     event_id: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       references: { model: 'events', key: 'id' }
//     },
//     venue_id: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       references: { model: 'venues', key: 'id' }
//     },
//     shift_id: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       references: { model: 'shifts', key: 'id' }
//     },
//     package_id: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       references: { model: 'packages', key: 'id' }
//     },
//     event_date: {
//       type: DataTypes.DATEONLY,
//       allowNull: false
//     },
//     guest_count: {
//       type: DataTypes.INTEGER,
//       allowNull: false
//     },
//     selected_menus: {
//       type: DataTypes.JSON
//     },
//     total_fare: {
//       type: DataTypes.FLOAT,
//       allowNull: false
//     },
//     status: {
//       type: DataTypes.STRING,
//       defaultValue: 'pending'
//     },
//     customer_phone: {
//       type: DataTypes.STRING,
//       allowNull: true // Nullable to avoid issues with existing records
//     }
//   }, {
//     tableName: 'bookings',
//     timestamps: true
//   });

//   Booking.associate = (models) => {
//     Booking.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
//     Booking.belongsTo(models.Event, { foreignKey: 'event_id', as: 'event' });
//     Booking.belongsTo(models.Venue, { foreignKey: 'venue_id', as: 'venue' });
//     Booking.belongsTo(models.Shift, { foreignKey: 'shift_id', as: 'shift' });
//     Booking.belongsTo(models.Package, { foreignKey: 'package_id', as: 'package' });
//   };

//   return Booking;
// };





































const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Booking = sequelize.define('Booking', {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      references: { model: 'users', key: 'id' }
    },
    event_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      references: { model: 'events', key: 'id' }
    },
    venue_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      references: { model: 'venues', key: 'id' }
    },
    shift_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      references: { model: 'shifts', key: 'id' }
    },
    package_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      references: { model: 'packages', key: 'id' }
    },
    event_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    guest_count: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    selected_menus: {
      type: DataTypes.JSON
    },
    total_fare: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'pending'
    },
    customer_phone: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'bookings',
    timestamps: true
  });

  Booking.associate = (models) => {
    Booking.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
      onDelete: 'SET DEFAULT',
      onUpdate: 'CASCADE'
    });

    Booking.belongsTo(models.Event, {
      foreignKey: 'event_id',
      as: 'event',
      onDelete: 'SET DEFAULT',
      onUpdate: 'CASCADE'
    });

    Booking.belongsTo(models.Venue, {
      foreignKey: 'venue_id',
      as: 'venue',
      onDelete: 'SET DEFAULT',
      onUpdate: 'CASCADE'
    });

    Booking.belongsTo(models.Shift, {
      foreignKey: 'shift_id',
      as: 'shift',
      onDelete: 'SET DEFAULT',
      onUpdate: 'CASCADE'
    });

    Booking.belongsTo(models.Package, {
      foreignKey: 'package_id',
      as: 'package',
      onDelete: 'SET DEFAULT',
      onUpdate: 'CASCADE'
    });
  };

  return Booking;
};
