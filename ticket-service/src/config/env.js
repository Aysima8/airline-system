require('dotenv').config();

module.exports = {
  PORT: process.env.TICKET_SERVICE_PORT || 3003,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Database
  DB_NAME: process.env.DB_NAME || 'airline_tickets',
  DB_USER: process.env.DB_USER || 'postgres',
  DB_PASSWORD: process.env.DB_PASSWORD || 'postgres',
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: process.env.DB_PORT || 5432,

  // Redis
  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: process.env.REDIS_PORT || 6379,

  // Services
  FLIGHT_SERVICE_URL: process.env.FLIGHT_SERVICE_URL || 'http://localhost:3002'
};
