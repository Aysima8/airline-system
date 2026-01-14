const Ticket = require('../models/ticket.model');

class TicketRepository {
  // Bilet oluştur
  async create(ticketData) {
    return await Ticket.create(ticketData);
  }

  // ID ile bilet bul
  async findById(id) {
    return await Ticket.findByPk(id);
  }

  // Kullanıcının biletlerini bul (with pagination)
  async findByUserId(userId, page = 1, pageSize = 10) {
    const offset = (page - 1) * pageSize;

    const { count, rows } = await Ticket.findAndCountAll({
      where: { userId },
      limit: parseInt(pageSize),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    return {
      tickets: rows,
      total: count
    };
  }

  // PNR ile bilet bul
  async findByPNR(pnr) {
    return await Ticket.findOne({
      where: { pnr }
    });
  }

  // Bilet güncelle
  async update(id, data) {
    const ticket = await Ticket.findByPk(id);
    if (!ticket) return null;

    await ticket.update(data);
    return ticket;
  }

  // Bilet sil
  async delete(id) {
    const ticket = await Ticket.findByPk(id);
    if (ticket) {
      await ticket.destroy();
    }
  }

  // Flight ID'lerine göre biletleri bul
  async findByFlightIds(flightIds) {
    return await Ticket.findAll({
      where: {
        flightId: flightIds
      },
      order: [['createdAt', 'DESC']]
    });
  }
}

module.exports = new TicketRepository();
