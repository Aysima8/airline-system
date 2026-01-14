const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const sequelize = require('./config/db');

// Routes
const ticketRoutes = require('./routes/ticket.routes');
const milesRoutes = require('./routes/miles.routes');

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database başlatma
const initializeApp = async () => {
  try {
    // Database sync
    await sequelize.sync({ alter: false });
    console.log('✅ Database modelleri senkronize edildi');
  } catch (error) {
    console.error('❌ Uygulama başlatma hatası:', error);
  }
};

initializeApp();

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Ticket Service çalışıyor',
    service: 'ticket-service'
  });
});

// Routes
app.use('/api/tickets', ticketRoutes);
app.use('/api/miles', milesRoutes);

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
