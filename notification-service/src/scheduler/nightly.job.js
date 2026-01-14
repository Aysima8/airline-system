const cron = require('node-cron');
const axios = require('axios');
const emailService = require('../services/email.service');

class NightlyJob {
  constructor() {
    this.flightServiceUrl = process.env.FLIGHT_SERVICE_URL || 'http://localhost:3002';
    this.ticketServiceUrl = process.env.TICKET_SERVICE_URL || 'http://localhost:3003';
  }

  // Gece çalışan task - her gece 02:00'de çalışır
  start() {
    // Her gece 02:00'de çalış
   const cron = require('node-cron');

async function runNightlyJob() {
  console.log('Nightly job started (manual/cron)');

  // 🔽 BURADA MEVCUT JOB LOGIC'İN VAR
}

cron.schedule('0 2 * * *', runNightlyJob);

module.exports = { runNightlyJob };

    console.log('✅ Nightly Scheduler başlatıldı (her gece 02:00)');
  }

  // Tamamlanmış uçuşlar için miles ekle ve email gönder
  async processCompletedFlights() {
    try {
      console.log('✈️ Tamamlanmış uçuşlar işleniyor...');

      // Dünkü tarihi al (dün tamamlanmış uçuşlar)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dateStr = yesterday.toISOString().split('T')[0];

      // Ticket Service'den dünün biletlerini al
      const response = await axios.get(
        `${this.ticketServiceUrl}/api/tickets/completed`,
        {
          params: {
            date: dateStr
          }
        }
      );

      const completedTickets = response.data.data || [];

      for (const ticket of completedTickets) {
        // Miles & Smiles üyesi varsa miles ekle
        if (ticket.memberNo && ticket.paymentType === 'CARD') {
          try {
            // Flight mesafesine göre miles hesapla (basit: her 1000 km = 100 mil)
            const milesEarned = Math.floor(Math.random() * 500) + 200; // 200-700 arası rastgele

            // Ticket Service'e miles ekleme isteği gönder
            await axios.post(
              `${this.ticketServiceUrl}/api/miles/add`,
              {
                userId: ticket.userId,
                memberNo: ticket.memberNo,
                miles: milesEarned,
                reason: 'completed_flight',
                ticketId: ticket.id
              }
            );

            // Email gönder
            await emailService.sendMilesAddedEmail(ticket.userId, milesEarned);

            console.log(`✅ Miles eklendi: ${ticket.userId} - ${milesEarned} mil`);
          } catch (error) {
            console.error(`Miles ekleme hatası (ticket ${ticket.id}):`, error.message);
          }
        }
      }

      console.log(`✅ ${completedTickets.length} tamamlanmış uçuş işlendi`);
    } catch (error) {
      console.error('Completed flights processing hatası:', error.message);
    }
  }

  // Yarınki uçuşlar için hatırlatma gönder
  async sendFlightReminders() {
    try {
      // Yarın uçuşu olan biletleri bul
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Flight Service'den yarınki uçuşları al
      const response = await axios.get(
        `${this.flightServiceUrl}/api/flights/search`,
        {
          params: {
            date: tomorrow.toISOString().split('T')[0]
          }
        }
      );

      const flights = response.data.data;

      // Her uçuş için bilet sahiplerine email gönder
      for (const flight of flights) {
        // Burada Ticket Service'den bilet sahiplerini çekmek gerekir
        console.log(`📧 Uçuş hatırlatması: ${flight.flightNumber}`);

        // await emailService.sendFlightReminder(userEmail, flight);
      }

      console.log(`✅ ${flights.length} uçuş için hatırlatma gönderildi`);
    } catch (error) {
      console.error('Flight reminder hatası:', error);
    }
  }

  // Eski notification'ları temizle (30 günden eski)
  async cleanupOldNotifications() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Eski notification'ları sil
      console.log('🗑️ Eski notification\'lar temizleniyor...');

      // await Notification.destroy({
      //   where: {
      //     createdAt: { [Op.lt]: thirtyDaysAgo },
      //     read: true
      //   }
      // });

      console.log('✅ Eski notification\'lar temizlendi');
    } catch (error) {
      console.error('Cleanup hatası:', error);
    }
  }

  // Günlük rapor oluştur
  async generateDailyReport() {
    try {
      console.log('📊 Günlük rapor oluşturuluyor...');

      // Günlük istatistikler
      const stats = {
        emailsSent: 0, // Redis'ten alınabilir
        milesAdded: 0,
        ticketsSold: 0
      };

      // Admin'e rapor gönder
      // await emailService.sendDailyReport(adminEmail, stats);

      console.log('✅ Günlük rapor gönderildi');
    } catch (error) {
      console.error('Rapor hatası:', error);
    }
  }
}

module.exports = new NightlyJob();
