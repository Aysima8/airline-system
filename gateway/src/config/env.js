require('dotenv').config();

module.exports = {
  PORT: process.env.GATEWAY_PORT || 3000,
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
  NODE_ENV: process.env.NODE_ENV || 'development'
};
