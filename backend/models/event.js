module.exports = (sequelize, DataTypes) => {
  const Event = sequelize.define(
    'Event',
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: 'events', // explicitly lowercase table name
      freezeTableName: true, // prevents Sequelize from pluralizing
    }
  );

  return Event;
};
