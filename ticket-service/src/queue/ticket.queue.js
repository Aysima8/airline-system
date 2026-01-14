const Bull = require('bull');
const milesService = require('../services/miles.service');

class TicketQueue {
  constructor() {
    // Miles job queue
    this.milesQueue = new Bull('miles-queue', {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379
      }
    });

    // Notification job queue
    this.notificationQueue = new Bull('notification-queue', {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379
      }
    });

    this.setupProcessors();
  }

  // Queue işleyicilerini ayarla
  setupProcessors() {
    // Miles işleme
    this.milesQueue.process(async (job) => {
      const { userId, ticketId, miles } = job.data;

      try {
        await milesService.addMiles(userId, miles, `Bilet ${ticketId} için mil`);
        console.log(`✅ Miles job tamamlandı: ${userId} - ${miles} mil`);
      } catch (error) {
        console.error('Miles job hatası:', error);
        throw error;
      }
    });

    // Notification işleme (Notification'a event atar)
    this.notificationQueue.process(async (job) => {
      const { userId, ticketId, type } = job.data;

      try {
        // Burada Notification Service'e event gönderilecek
        console.log(`📧 Notification event: ${type} - User: ${userId} - Ticket: ${ticketId}`);

        // Notification Service entegrasyonu burada yapılacak
        // await notificationService.sendEvent({ userId, ticketId, type });

      } catch (error) {
        console.error('Notification job hatası:', error);
        throw error;
      }
    });

    // Error handlers
    this.milesQueue.on('failed', (job, err) => {
      console.error(`Miles job başarısız: ${job.id}`, err);
    });

    this.notificationQueue.on('failed', (job, err) => {
      console.error(`Notification job başarısız: ${job.id}`, err);
    });
  }

  // Miles job ekle
  async addMilesJob(data) {
    return await this.milesQueue.add(data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      }
    });
  }

  // Notification job ekle
  async addNotificationJob(data) {
    return await this.notificationQueue.add(data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      }
    });
  }
}

module.exports = new TicketQueue();
