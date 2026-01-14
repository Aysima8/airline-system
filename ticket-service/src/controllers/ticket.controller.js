const ticketService = require('../services/ticket.service');

class TicketController {
  // Bilet satın alma (with CARD or MILES)
  async purchaseTicket(req, res) {
    try {
      const userId = req.user.id; // Auth middleware'den gelir
      const { flightId, passengers, paymentType = 'CARD', memberNo, paymentInfo } = req.body;

      // Validation
      if (!flightId || !passengers || passengers.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Uçuş ID ve yolcu bilgileri gereklidir'
        });
      }

      // Validate payment type
      if (!['CARD', 'MILES'].includes(paymentType)) {
        return res.status(400).json({
          success: false,
          message: 'Geçersiz ödeme tipi. CARD veya MILES olmalı'
        });
      }

      // MILES için memberNo gerekli
      if (paymentType === 'MILES' && !memberNo) {
        return res.status(400).json({
          success: false,
          message: 'Miles & Smiles üye numarası gerekli'
        });
      }

      // CARD için paymentInfo gerekli
      if (paymentType === 'CARD' && !paymentInfo) {
        return res.status(400).json({
          success: false,
          message: 'Kart bilgileri gerekli'
        });
      }

      const result = await ticketService.purchaseTicket({
        userId,
        flightId,
        passengers,
        paymentType,
        memberNo,
        paymentInfo
      });

      res.status(201).json({
        success: true,
        message: 'Bilet başarıyla satın alındı',
        data: result
      });
    } catch (error) {
      // Handle specific error codes
      const statusCode = error.statusCode || 500;

      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  // Kullanıcının biletlerini getir (with pagination)
  async getUserTickets(req, res) {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 10;

      const result = await ticketService.getUserTickets(userId, page, pageSize);

      res.status(200).json({
        success: true,
        data: result.tickets,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Bilet detayını getir
  async getTicketById(req, res) {
    try {
      const ticket = await ticketService.getTicketById(req.params.id);

      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: 'Bilet bulunamadı'
        });
      }

      res.status(200).json({
        success: true,
        data: ticket
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Bilet iptal et
  async cancelTicket(req, res) {
    try {
      const userId = req.user.id;
      const ticketId = req.params.id;

      await ticketService.cancelTicket(ticketId, userId);

      res.status(200).json({
        success: true,
        message: 'Bilet iptal edildi'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Tamamlanmış uçuşların biletlerini getir (Scheduler için)
  async getCompletedTickets(req, res) {
    try {
      const { date } = req.query;

      if (!date) {
        return res.status(400).json({
          success: false,
          message: 'Tarih parametresi gerekli'
        });
      }

      const tickets = await ticketService.getCompletedTickets(date);

      res.status(200).json({
        success: true,
        data: tickets
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new TicketController();
