const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Otp = sequelize.define('Otp', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    otp_code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  }, {
    tableName: 'otps',
    timestamps: false,
  });

  Otp.associate = (models) => {
    Otp.belongsTo(models.User, { foreignKey: 'user_id' });
  };

  return Otp;
};