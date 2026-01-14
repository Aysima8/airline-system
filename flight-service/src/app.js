const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const sequelize = require('./config/db');
const airportCache = require('./cache/airport.cache');
const routesCache = require('./cache/routes.cache');

// Routes
const flightRoutes = require('./routes/flight.routes');
const adminFlightRoutes = require('./routes/admin-flight.routes');

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database & Cache başlatma
const initializeApp = async () => {
  try {
    // Database sync
    await sequelize.sync({ alter: false });
    console.log('✅ Database modelleri senkronize edildi');

    // Redis bağlantısı
    await airportCache.connect();
    await routesCache.connect();

    // Cache warm up
    await airportCache.warmUp();
    await routesCache.warmUp();
  } catch (error) {
    console.error('❌ Uygulama başlatma hatası:', error);
  }
};

initializeApp();

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Flight Service çalışıyor',
    service: 'flight-service'
  });
});

// Routes
app.use('/api/flights', flightRoutes);
app.use('/api/v1/admin', adminFlightRoutes);

// 404 handler
app.use('*', (req, res) => {
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
