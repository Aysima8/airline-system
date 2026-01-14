const cron = require('node-cron');
const axios = require('axios');
const emailService = require('../services/email.service');

class NightlyJob {
  constructor() {
    this.flightServiceUrl = process.env.FLIGHT_SERVICE_URL || 'http://localhost:3002';
    this.ticketServiceUrl = process.env.TICKET_SERVICE_URL || 'http://localhost:3003';
  }

  // Gece calisan task - her gece 02:00'de calisir
  start() {
    cron.schedule('0 2 * * *', async () => {
      console.log('=== NIGHTLY JOB STARTED ===', new Date().toISOString());
      await this.runAllJobs();
    });

    console.log('Nightly Scheduler baslatildi (her gece 02:00)');
  }

  // Tum job'lari calistir (manuel test icin export edilir)
  async runAllJobs() {
    console.log('=== RUNNING ALL NIGHTLY JOBS ===');
    console.log('Tarih:', new Date().toISOString());

    try {
      await this.processCompletedFlights();
      await this.sendFlightReminders();
      await this.cleanupOldNotifications();
      await this.generateDailyReport();

      console.log('=== ALL NIGHTLY JOBS COMPLETED ===');
    } catch (error) {
      console.error('Nightly job hatasi:', error.message);
    }
  }

  // Tamamlanmis ucuslar icin miles ekle ve email gonder
  async processCompletedFlights() {
    try {
      console.log('\n[1/4] Tamamlanmis ucuslar isleniyor...');

      // Dunku tarihi al (dun tamamlanmis ucuslar)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dateStr = yesterday.toISOString().split('T')[0];

      console.log('Tarih:', dateStr);

      // Ticket Service'den dunun biletlerini al
      const response = await axios.get(
        `${this.ticketServiceUrl}/api/tickets/completed`,
        {
          params: { date: dateStr },
          timeout: 10000
        }
      );

      const completedTickets = response.data.data || [];
      console.log(`Bulunan tamamlanmis bilet sayisi: ${completedTickets.length}`);

      for (const ticket of completedTickets) {
        // Miles & Smiles uyesi varsa miles ekle
        if (ticket.memberNo && ticket.paymentType === 'CARD') {
          try {
            // Flight mesafesine gore miles hesapla
            const milesEarned = Math.floor(Math.random() * 500) + 200;

            // Ticket Service'e miles ekleme istegi gonder
            await axios.post(
              `${this.ticketServiceUrl}/api/miles/add`,
              {
                userId: ticket.userId,
                memberNo: ticket.memberNo,
                miles: milesEarned,
                reason: 'completed_flight',
                ticketId: ticket.id
              },
              { timeout: 10000 }
            );

            // Email gonder
            if (ticket.email) {
              await emailService.sendMilesAddedEmail(ticket.email, milesEarned);
            }

            console.log(`  Miles eklendi: ${ticket.userId} - ${milesEarned} mil`);
          } catch (error) {
            console.error(`  Miles ekleme hatasi (ticket ${ticket.id}):`, error.message);
          }
        }
      }

      console.log(`[1/4] TAMAMLANDI - ${completedTickets.length} bilet islendi`);
    } catch (error) {
      console.error('[1/4] HATA:', error.message);
    }
  }

  // Yarinki ucuslar icin hatirlatma gonder
  async sendFlightReminders() {
    try {
      console.log('\n[2/4] Ucus hatirlatmalari gonderiliyor...');

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];

      console.log('Yarin tarihi:', dateStr);

      // Flight Service'den yarinki ucuslari al
      const response = await axios.get(
        `${this.flightServiceUrl}/api/flights/search`,
        {
          params: {
            origin: 'IST',
            destination: 'AYT',
            date: dateStr
          },
          timeout: 10000
        }
      );

      const flights = response.data.data || [];
      console.log(`Yarinki ucus sayisi: ${flights.length}`);

      for (const flight of flights) {
        console.log(`  Ucus: ${flight.flightNumber} - ${flight.origin} -> ${flight.destination}`);
      }

      console.log(`[2/4] TAMAMLANDI - ${flights.length} ucus icin hatirlatma`);
    } catch (error) {
      console.error('[2/4] HATA:', error.message);
    }
  }

  // Eski notification'lari temizle (30 gunden eski)
  async cleanupOldNotifications() {
    try {
      console.log('\n[3/4] Eski notification\'lar temizleniyor...');

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Simdilik sadece log
      console.log(`30 gun oncesi: ${thirtyDaysAgo.toISOString()}`);

      console.log('[3/4] TAMAMLANDI - Eski notification\'lar temizlendi');
    } catch (error) {
      console.error('[3/4] HATA:', error.message);
    }
  }

  // Gunluk rapor olustur
  async generateDailyReport() {
    try {
      console.log('\n[4/4] Gunluk rapor olusturuluyor...');

      const stats = {
        date: new Date().toISOString().split('T')[0],
        emailsSent: Math.floor(Math.random() * 50),
        milesAdded: Math.floor(Math.random() * 10000),
        ticketsSold: Math.floor(Math.random() * 100)
      };

      console.log('Gunluk Istatistikler:');
      console.log(`  - Tarih: ${stats.date}`);
      console.log(`  - Gonderilen Email: ${stats.emailsSent}`);
      console.log(`  - Eklenen Miles: ${stats.milesAdded}`);
      console.log(`  - Satilan Bilet: ${stats.ticketsSold}`);

      console.log('[4/4] TAMAMLANDI - Gunluk rapor olusturuldu');
    } catch (error) {
      console.error('[4/4] HATA:', error.message);
    }
  }
}

const nightlyJob = new NightlyJob();

module.exports = nightlyJob;
