const Flight = require('../models/flight.model');
const { Op } = require('sequelize');

class FlightRepository {
  // Tüm uçuşları getir (with pagination)
  async findAll(page = 1, pageSize = 10) {
    const offset = (page - 1) * pageSize;

    const { count, rows } = await Flight.findAndCountAll({
      limit: parseInt(pageSize),
      offset: parseInt(offset),
      order: [['departureTime', 'ASC']]
    });

    return {
      flights: rows,
      total: count
    };
  }

  // ID ile uçuş bul
  async findById(id) {
    return await Flight.findByPk(id);
  }

  // Uçuş arama
  async search({ origin, destination, date }) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await Flight.findAll({
      where: {
        origin: origin.toUpperCase(),
        destination: destination.toUpperCase(),
        departureTime: {
          [Op.between]: [startOfDay, endOfDay]
        },
        status: 'scheduled'
      },
      order: [['departureTime', 'ASC']]
    });
  }

  // Yeni uçuş oluştur
  async create(flightData) {
    return await Flight.create(flightData);
  }

  // Uçuş güncelle
  async update(id, flightData) {
    const flight = await Flight.findByPk(id);
    if (!flight) return null;

    await flight.update(flightData);
    return flight;
  }

  // Uçuş sil
  async delete(id) {
    const flight = await Flight.findByPk(id);
    if (flight) {
      await flight.destroy();
    }
  }

  // Koltuk sayısını güncelle
  async updateAvailableSeats(id, seats) {
    const flight = await Flight.findByPk(id);
    if (!flight) return null;

    await flight.update({
      availableSeats: flight.availableSeats - seats
    });

    return flight;
  }

  // Advanced search with flexible date, direct flights, pagination
  async advancedSearch({ origin, destination, date, flexDays = 0, directOnly = false, page = 1, pageSize = 10 }) {
    const baseDate = new Date(date);

    // Flexible date range
    const startDate = new Date(baseDate);
    startDate.setDate(startDate.getDate() - flexDays);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(baseDate);
    endDate.setDate(endDate.getDate() + flexDays);
    endDate.setHours(23, 59, 59, 999);

    const where = {
      origin: origin.toUpperCase(),
      destination: destination.toUpperCase(),
      departureTime: {
        [Op.between]: [startDate, endDate]
      },
      status: 'scheduled'
    };

    // Direct flights only filter
    // Assuming stops info will be in flight data or we check duration
    // For now, we'll add this as a placeholder for future enhancement

    const offset = (page - 1) * pageSize;

    const { count, rows } = await Flight.findAndCountAll({
      where,
      limit: parseInt(pageSize),
      offset: parseInt(offset),
      order: [['departureTime', 'ASC']],
      attributes: [
        'id',
        'flightNumber',
        'airline',
        'origin',
        'destination',
        'departureTime',
        'arrivalTime',
        'totalSeats',
        'availableSeats',
        'basePrice',
        'duration',
        'status'
      ]
    });

    return {
      flights: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        totalPages: Math.ceil(count / pageSize)
      }
    };
  }

  // Get popular routes (for caching)
  async getPopularRoutes(limit = 10) {
    const routes = await Flight.findAll({
      attributes: [
        'origin',
        'destination',
        [Flight.sequelize.fn('COUNT', Flight.sequelize.col('id')), 'flightCount']
      ],
      group: ['origin', 'destination'],
      order: [[Flight.sequelize.literal('flightCount'), 'DESC']],
      limit: parseInt(limit),
      raw: true
    });

    return routes;
  }
}

module.exports = new FlightRepository();
