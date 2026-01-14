const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Airline System API',
      version: '1.0.0',
      description: 'API Gateway for Airline Reservation System',
    },
    servers: [{ url: 'http://localhost:3000' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Routes
const authRoutes = require('./routes/auth.routes');
const flightRoutes = require('./routes/flight.routes');
const ticketRoutes = require('./routes/ticket.routes');
const milesRoutes = require('./routes/miles.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

// Middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Swagger için CSP'yi devre dışı bırak
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger UI
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerSpec));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API Gateway çalışıyor'
  });
});

// API Version 1 Routes - tüm istekler geçtiği tek giriş noktası
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/flights', flightRoutes);
app.use('/api/v1/tickets', ticketRoutes);
app.use('/api/v1/miles', milesRoutes);
app.use('/api/v1/admin', adminRoutes);

// Legacy routes (redirect to v1) - Backward compatibility
app.use('/api/auth', authRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/miles', milesRoutes);

// 404 handler - Sadece /api ile başlayanlar için
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint bulunamadı'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Sunucu hatası',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = app;
