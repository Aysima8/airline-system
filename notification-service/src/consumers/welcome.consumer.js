const Bull = require('bull');
const emailService = require('../services/email.service');

class WelcomeConsumer {
  constructor() {
    // Yeni kullanıcı kayıt event'lerini dinle
    this.queue = new Bull('welcome-queue', {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379
      }
    });

    this.setupConsumer();
  }

  setupConsumer() {
    // Welcome email job'ını işle
    this.queue.process(async (job) => {
      const { userId, email, name } = job.data;

      try {
        console.log(`📨 Welcome event alındı: ${email}`);

        // Welcome email gönder
        await emailService.sendWelcomeEmail(email, name);

        console.log(`✅ Welcome email gönderildi: ${email}`);
      } catch (error) {
        console.error('Welcome consumer hatası:', error);
        throw error;
      }
    });

    this.queue.on('failed', (job, err) => {
      console.error(`Welcome consumer job başarısız: ${job.id}`, err);
    });

    console.log('✅ Welcome Consumer başlatıldı');
  }
}

module.exports = new WelcomeConsumer();
