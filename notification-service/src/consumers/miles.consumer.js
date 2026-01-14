const Bull = require('bull');
const emailService = require('../services/email.service');
const notificationService = require('../services/notification.service');

class MilesConsumer {
  constructor() {
    // Ticket Service'den gelen miles job'larını dinle
    this.queue = new Bull('miles-queue', {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379
      }
    });

    this.setupConsumer();
  }

  setupConsumer() {
    // Miles ekleme event'ini dinle
    this.queue.on('completed', async (job, result) => {
      try {
        const { userId, ticketId, miles } = job.data;

        console.log(`📨 Miles eklendi event alındı: ${userId} - ${miles} mil`);

        // Email gönder
        await emailService.sendMilesAddedEmail(userId, miles);

        // Notification kaydet
        await notificationService.createNotification({
          userId,
          type: 'miles_added',
          title: 'Mil Kazandınız!',
          message: `${miles} mil hesabınıza eklendi. Bilet: ${ticketId}`,
          data: { ticketId, miles }
        });

        console.log(`✅ Miles notification gönderildi: ${userId}`);
      } catch (error) {
        console.error('Miles consumer hatası:', error);
      }
    });

    this.queue.on('failed', (job, err) => {
      console.error(`Miles consumer job başarısız: ${job.id}`, err);
    });

    console.log('✅ Miles Consumer başlatıldı');
  }
}

module.exports = new MilesConsumer();
