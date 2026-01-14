const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

class EmailService {
  constructor() {
    // Mail transporter oluştur
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  // Welcome email gönder
  async sendWelcomeEmail(email, name) {
    try {
      const template = this.loadTemplate('welcome.html');
      const html = template.replace('{{name}}', name);

      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@airline.com',
        to: email,
        subject: 'Hoş Geldiniz! ✈️',
        html: html
      });

      console.log(`✅ Welcome email gönderildi: ${email}`);
    } catch (error) {
      console.error('Welcome email hatası:', error);
      throw error;
    }
  }

  // Miles eklendi email'i gönder
  async sendMilesAddedEmail(userId, miles) {
    try {
      // Kullanıcı email'ini al (Auth Service'den veya cache'den)
      const userEmail = await this.getUserEmail(userId);

      const template = this.loadTemplate('miles-added.html');
      const html = template
        .replace('{{miles}}', miles)
        .replace('{{totalMiles}}', '...');

      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@airline.com',
        to: userEmail,
        subject: `${miles} Mil Kazandınız! 🎉`,
        html: html
      });

      console.log(`✅ Miles email gönderildi: ${userEmail}`);
    } catch (error) {
      console.error('Miles email hatası:', error);
      throw error;
    }
  }

  // Bilet satın alma email'i gönder
  async sendTicketPurchaseEmail(userId, ticketId, flightNumber, passengers, pnr, totalPrice, paymentType) {
    try {
      const userEmail = await this.getUserEmail(userId);

      const template = this.loadTemplate('ticket-purchased.html');
      const html = template
        .replace('{{pnr}}', pnr || 'XXXXXX')
        .replace('{{flightNumber}}', flightNumber)
        .replace('{{passengers}}', passengers)
        .replace('{{totalPrice}}', totalPrice || '0')
        .replace('{{paymentType}}', paymentType === 'MILES' ? 'Miles & Smiles' : 'Kredi Kartı');

      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@airline.com',
        to: userEmail,
        subject: `Biletiniz Onaylandı - ${flightNumber} ✈️`,
        html: html
      });

      console.log(`✅ Ticket purchase email gönderildi: ${userEmail}`);
    } catch (error) {
      console.error('Ticket purchase email hatası:', error);
      throw error;
    }
  }

  // Uçuş hatırlatma email'i
  async sendFlightReminder(email, flight) {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@airline.com',
        to: email,
        subject: `Uçuş Hatırlatma: ${flight.flightNumber} ✈️`,
        html: `
          <h2>Uçuş Hatırlatma</h2>
          <p>Yarın uçuşunuz var!</p>
          <p><strong>Uçuş:</strong> ${flight.flightNumber}</p>
          <p><strong>Kalkış:</strong> ${flight.origin} - ${flight.departureTime}</p>
          <p><strong>Varış:</strong> ${flight.destination} - ${flight.arrivalTime}</p>
        `
      });

      console.log(`✅ Flight reminder gönderildi: ${email}`);
    } catch (error) {
      console.error('Flight reminder hatası:', error);
    }
  }

  // Template yükle
  loadTemplate(templateName) {
    const templatePath = path.join(__dirname, '../templates', templateName);
    return fs.readFileSync(templatePath, 'utf-8');
  }

  // Kullanıcı email'ini al (örnek)
  async getUserEmail(userId) {
    // Burada Auth Service'e istek atılabilir
    // veya Redis cache'den alınabilir
    return `user-${userId}@example.com`;
  }
}

module.exports = new EmailService();
