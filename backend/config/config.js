// config/config.js

require('dotenv').config();

module.exports = {
  // Session config
  sessionSecret: process.env.SESSION_SECRET,
  sessionMaxAge: process.env.SESSION_MAX_AGE || 30 * 60 * 1000, // Default 30 minutes (in milliseconds)

  // JWT config
  jwtSecret: process.env.JWT_SECRET,

  // Database config
  db: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
    dialect: process.env.DB_DIALECT
  },

  // Mail config
  mail: {
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    username: process.env.MAIL_USERNAME,
    password: process.env.MAIL_PASSWORD,
    from: process.env.MAIL_FROM
  },

  // Environment
  nodeEnv: process.env.NODE_ENV
};
