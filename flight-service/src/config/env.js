require('dotenv').config();

module.exports = {
  PORT: process.env.FLIGHT_SERVICE_PORT || 3002,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Database
  DB_NAME: process.env.DB_NAME || 'airline_flights',
  DB_USER: process.env.DB_USER || 'postgres',
  DB_PASSWORD: process.env.DB_PASSWORD || 'postgres',
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: process.env.DB_PORT || 5432,

  // Redis
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',

  // ML Service
  ML_SERVICE_URL: process.env.ML_SERVICE_URL || 'http://localhost:5000'
};
