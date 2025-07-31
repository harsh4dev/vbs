const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize) => {
    const User = sequelize.define('User', {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Phone number is required'
                },
                len: {
                    args: [10, 10],
                    msg: 'Phone number must be exactly 10 digits'
                },
                isNumeric: {
                    msg: 'Phone number must contain only digits'
                }
            }
        },
        email_verified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        verification_token: {
            type: DataTypes.STRING,
            allowNull: true
        },
        verification_token_expires: {
            type: DataTypes.DATE,
            allowNull: true
        },
        reset_password_token: {
            type: DataTypes.STRING,
            allowNull: true
        },
        reset_password_expires: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        tableName: 'users',
        timestamps: true
    });

    // Hash password before creating or updating
    User.beforeCreate(async (user) => {
        if (user.password) {
            user.password = await bcrypt.hash(user.password, 10);
        }
    });

    User.beforeUpdate(async (user) => {
        if (user.changed('password')) {
            user.password = await bcrypt.hash(user.password, 10);
        }
    });

    // Utility to get user initials
    User.prototype.initials = function () {
        return this.name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase();
    };

    return User;
};