const ticketRepository = require('../repositories/ticket.repository');
const milesService = require('./miles.service');
const paymentMock = require('./payment.mock');
const ticketQueue = require('../queue/ticket.queue');
const axios = require('axios');

class TicketService {
  constructor() {
    this.flightServiceUrl = process.env.FLIGHT_SERVICE_URL || 'http://localhost:3002';
  }

  // Bilet satın alma
  async purchaseTicket({ userId, flightId, passengers, paymentType = 'CARD', memberNo = null, paymentInfo }) {
    try {
      // 1. Flight Service'den uçuş bilgilerini al
      const flight = await this.getFlightDetails(flightId);

      if (!flight) {
        throw new Error('Uçuş bulunamadı');
      }

      // 2. Kapasite kontrolü - 409 Conflict
      if (flight.availableSeats < passengers.length) {
        const error = new Error('Yeterli koltuk yok');
        error.statusCode = 409;
        throw error;
      }

      const passengerCount = passengers.length;
      const totalPrice = flight.calculatedPrice || flight.basePrice || 5000;
      const finalPrice = totalPrice * passengerCount;

      let milesUsed = 0;
      let milesEarned = 0;
      let payment;

      // 3a. MILES ile ödeme kontrolü
      if (paymentType === 'MILES') {
        if (!memberNo) {
          throw new Error('Miles & Smiles üye numarası gerekli');
        }

        // Miles gereksinimi (1 mil = 10 TL)
        const requiredMiles = Math.ceil(finalPrice / 10);

        // Kullanıcının miles bakiyesi
        const userMiles = await milesService.getMilesBalance(userId, memberNo);

        if (userMiles < requiredMiles) {
          const error = new Error(`Yetersiz Miles puanı. Gerekli: ${requiredMiles}, Mevcut: ${userMiles}`);
          error.statusCode = 409;
          throw error;
        }

        // Miles kullan
        await milesService.useMiles(userId, memberNo, requiredMiles);
        milesUsed = requiredMiles;

        // Mock payment (Miles için)
        payment = {
          success: true,
          transactionId: `MILES_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
      }
      // 3b. CARD ile ödeme
      else {
        payment = await paymentMock.processPayment({
          amount: finalPrice,
          ...paymentInfo
        });

        if (!payment.success) {
          throw new Error('Ödeme başarısız');
        }

        // CARD ile satın alımda miles kazan (deterministik hesaplama)
        if (memberNo) {
          // Flight'tan cabin class al (yoksa economy kabul et)
          const cabin = flight.cabin || 'economy';
          milesEarned = milesService.calculateFlightMiles(finalPrice, cabin, flight.distance);
        }
      }

      // 4. Bilet oluştur
      const ticket = await ticketRepository.create({
        userId,
        flightId,
        passengers,
        totalPrice: finalPrice,
        paymentType,
        milesUsed,
        milesEarned,
        memberNo,
        paymentId: payment.transactionId,
        status: 'confirmed'
      });

      // 5. Miles kazanç (CARD ile alım)
      if (paymentType === 'CARD' && memberNo && milesEarned > 0) {
        await ticketQueue.addMilesJob({
          userId,
          memberNo,
          ticketId: ticket.id,
          miles: milesEarned,
          action: 'earn'
        });
      }

      // 6. Notification gönder (asenkron)
      await ticketQueue.addNotificationJob({
        userId,
        ticketId: ticket.id,
        type: 'ticket_purchased',
        flightNumber: flight.flightNumber,
        passengers: passengerCount
      });

      // 7. Flight Service'e koltuk sayısını güncelle
      await this.updateFlightSeats(flightId, passengerCount);

      return ticket;
    } catch (error) {
      // Error code preserve
      if (error.statusCode) {
        const err = new Error(error.message);
        err.statusCode = error.statusCode;
        throw err;
      }
      throw new Error(`Bilet satın alma hatası: ${error.message}`);
    }
  }

  // Kullanıcının biletlerini getir (with pagination)
  async getUserTickets(userId, page = 1, pageSize = 10) {
    const result = await ticketRepository.findByUserId(userId, page, pageSize);

    // Her bilet icin ucus bilgilerini ekle
    const ticketsWithFlights = await Promise.all(
      result.tickets.map(async (ticket) => {
        const ticketData = ticket.toJSON ? ticket.toJSON() : ticket;
        const flight = await this.getFlightDetails(ticketData.flightId);

        // Yolcu bilgilerini duzgun formatta dondur
        const passengers = ticketData.passengers || [];
        const firstPassenger = passengers[0] || {};

        return {
          ...ticketData,
          flight: flight || null,
          // Frontend icin ek alanlar
          passengerName: firstPassenger.firstName
            ? `${firstPassenger.firstName} ${firstPassenger.lastName || ''}`
            : (firstPassenger.name || 'Bilinmiyor'),
          passengerCount: passengers.length,
          price: ticketData.totalPrice
        };
      })
    );

    return {
      tickets: ticketsWithFlights,
      pagination: {
        total: result.total,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        totalPages: Math.ceil(result.total / pageSize)
      }
    };
  }

  // Bilet detayı
  async getTicketById(ticketId) {
    return await ticketRepository.findById(ticketId);
  }

  // Bilet iptal
  async cancelTicket(ticketId, userId) {
    const ticket = await ticketRepository.findById(ticketId);

    if (!ticket) {
      throw new Error('Bilet bulunamadı');
    }

    if (ticket.userId !== userId) {
      throw new Error('Bu işlem için yetkiniz yok');
    }

    if (ticket.status === 'cancelled') {
      throw new Error('Bilet zaten iptal edilmiş');
    }

    // Bilet durumunu güncelle
    await ticketRepository.update(ticketId, { status: 'cancelled' });

    // Flight Service'e koltuk sayısını geri ekle
    await this.updateFlightSeats(ticket.flightId, -ticket.passengers.length);

    return true;
  }

  // Flight Service'den uçuş bilgisi al
  async getFlightDetails(flightId) {
    try {
      const response = await axios.get(`${this.flightServiceUrl}/api/flights/${flightId}`);
      return response.data.data;
    } catch (error) {
      console.error('Flight Service iletişim hatası:', error.message);
      return null;
    }
  }

  // Flight Service'de koltuk sayısını güncelle
  async updateFlightSeats(flightId, seats) {
    try {
      await axios.patch(`${this.flightServiceUrl}/api/flights/${flightId}/seats`, {
        seats
      });
    } catch (error) {
      console.error('Koltuk güncelleme hatası:', error.message);
    }
  }

  // Belirli tarihteki tamamlanmış uçuşların biletlerini getir
  async getCompletedTickets(date) {
    try {
      // Flight Service'den o tarihteki uçuşları al
      const response = await axios.get(`${this.flightServiceUrl}/api/flights/search`, {
        params: {
          date: date
        }
      });

      const flights = response.data.data || [];
      const flightIds = flights.map(f => f.id);

      if (flightIds.length === 0) {
        return [];
      }

      // O uçuşlara ait biletleri bul
      const tickets = await ticketRepository.findByFlightIds(flightIds);
      return tickets.filter(t => t.status === 'confirmed');
    } catch (error) {
      console.error('Completed tickets hatası:', error.message);
      return [];
    }
  }
}

module.exports = new TicketService();
