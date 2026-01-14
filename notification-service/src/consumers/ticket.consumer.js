const Bull = require('bull');
const emailService = require('../services/email.service');
const notificationService = require('../services/notification.service');

class TicketConsumer {
  constructor() {
    // Ticket Service'den gelen notification job'larını dinle
    this.queue = new Bull('notification-queue', {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379
      }
    });

    this.setupConsumer();
  }

  setupConsumer() {
    // Ticket purchase notification job'ını işle
    this.queue.process(async (job) => {
      const { userId, ticketId, type, flightNumber, passengers } = job.data;

      try {
        console.log(`📨 Ticket event alındı: ${type} - ${ticketId}`);

        if (type === 'ticket_purchased') {
          // Email gönder
          await emailService.sendTicketPurchaseEmail(userId, ticketId, flightNumber, passengers);

          // Notification kaydet
          await notificationService.createNotification({
            userId,
            type: 'ticket_purchased',
            title: 'Bilet Satın Alındı!',
            message: `${flightNumber} uçuşu için ${passengers} yolcu biletiniz onaylandı.`,
            data: { ticketId, flightNumber, passengers }
          });

          console.log(`✅ Ticket purchase notification gönderildi: ${userId}`);
        }
      } catch (error) {
        console.error('Ticket consumer hatası:', error);
        throw error;
      }
    });

    this.queue.on('failed', (job, err) => {
      console.error(`Ticket consumer job başarısız: ${job.id}`, err);
    });

    console.log('✅ Ticket Consumer başlatıldı');
  }
}

module.exports = new TicketConsumer();
