const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level}: ${message}`;
    })
  ),
  transports: [
    // Remove or comment this out to stop logging to the console
    // new winston.transports.Console(),

    new winston.transports.File({ filename: './logs/sequelize-logs.log' })
  ],
});

module.exports = logger;
