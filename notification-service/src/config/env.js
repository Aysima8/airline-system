require('dotenv').config();

module.exports = {
  PORT: process.env.NOTIFICATION_SERVICE_PORT || 3004,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Redis
  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: process.env.REDIS_PORT || 6379,

  // RabbitMQ
  RABBITMQ_URL: process.env.RABBITMQ_URL || 'amqp://localhost',

  // SMTP Email
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: process.env.SMTP_PORT || 587,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  SMTP_FROM: process.env.SMTP_FROM || 'noreply@airline.com',

  // Services
  FLIGHT_SERVICE_URL: process.env.FLIGHT_SERVICE_URL || 'http://localhost:3002',
  TICKET_SERVICE_URL: process.env.TICKET_SERVICE_URL || 'http://localhost:3003'
};
