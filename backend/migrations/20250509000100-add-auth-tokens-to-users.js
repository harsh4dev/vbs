'use strict';

module.exports = {
up: async (queryInterface, Sequelize) => {
await queryInterface.addColumn('users', 'verification_token', {
type: Sequelize.STRING,
allowNull: true
});

await queryInterface.addColumn('users', 'verification_token_expires', {
  type: Sequelize.DATE,
  allowNull: true
});

await queryInterface.addColumn('users', 'reset_password_token', {
  type: Sequelize.STRING,
  allowNull: true
});

await queryInterface.addColumn('users', 'reset_password_expires', {
  type: Sequelize.DATE,
  allowNull: true
});
},

down: async (queryInterface, Sequelize) => {
await queryInterface.removeColumn('users', 'verification_token');
await queryInterface.removeColumn('users', 'verification_token_expires');
await queryInterface.removeColumn('users', 'reset_password_token');
await queryInterface.removeColumn('users', 'reset_password_expires');
}
};