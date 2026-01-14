const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Consumers
const milesConsumer = require('./consumers/miles.consumer');
const welcomeConsumer = require('./consumers/welcome.consumer');
const ticketConsumer = require('./consumers/ticket.consumer');

// Scheduler
const nightlyJob = require('./scheduler/nightly.job');

// Queue
const rabbitmq = require('./queue/rabbitmq');

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Uygulama başlatma
const initializeApp = async () => {
  try {
    console.log('🚀 Notification Service başlatılıyor...');

    // RabbitMQ bağlantısı
    await rabbitmq.connect();

    // Consumers başlat (Bull queue'lar otomatik dinler)
    console.log('✅ Queue Consumers başlatıldı');

    // Scheduler başlat
    nightlyJob.start();

    console.log('✅ Notification Service hazır');
  } catch (error) {
    console.error('❌ Uygulama başlatma hatası:', error);
  }
};

initializeApp();

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Notification Service çalışıyor',
    service: 'notification-service',
    features: {
      email: true,
      scheduler: true,
      queueConsumer: true
    }
  });
});

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

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM alındı, servis kapatılıyor...');
  await rabbitmq.close();
  process.exit(0);
});

module.exports = app;
