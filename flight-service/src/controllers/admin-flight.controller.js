const Flight = require('../models/flight.model');
const FlightInventory = require('../models/flight-inventory.model');
const Airport = require('../models/airport.model');

class AdminFlightController {
  // Admin: Yeni uçuş oluştur (template flight)
  async createFlight(req, res) {
    try {
      const {
        flightNumber,
        airline,
        origin,
        destination,
        departureTime,
        arrivalTime,
        totalSeats,
        basePrice,
        duration
      } = req.body;

      // Validasyon
      if (!flightNumber || !airline || !origin || !destination) {
        return res.status(400).json({
          success: false,
          message: 'Gerekli alanlar eksik'
        });
      }

      // Havaalanı kodlarını kontrol et
      const originAirport = await Airport.findOne({ where: { code: origin.toUpperCase() } });
      const destAirport = await Airport.findOne({ where: { code: destination.toUpperCase() } });

      if (!originAirport || !destAirport) {
        return res.status(400).json({
          success: false,
          message: 'Geçersiz havaalanı kodu'
        });
      }

      // Uçuşu oluştur
      const flight = await Flight.create({
        flightNumber: flightNumber.toUpperCase(),
        airline,
        origin: origin.toUpperCase(),
        destination: destination.toUpperCase(),
        departureTime: new Date(departureTime),
        arrivalTime: new Date(arrivalTime),
        totalSeats: totalSeats || 180,
        availableSeats: totalSeats || 180,
        basePrice,
        duration,
        status: 'scheduled'
      });

      res.status(201).json({
        success: true,
        message: 'Uçuş başarıyla oluşturuldu',
        data: flight
      });
    } catch (error) {
      console.error('Admin create flight error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Admin: Belirli bir tarihe uçuş inventory ekle
  async createFlightInventory(req, res) {
    try {
      const { flightId } = req.params;
      const { date, totalSeats, basePrice } = req.body;

      // Flight kontrolü
      const flight = await Flight.findByPk(flightId);
      if (!flight) {
        return res.status(404).json({
          success: false,
          message: 'Uçuş bulunamadı'
        });
      }

      // Aynı tarih için inventory var mı kontrol et
      const existingInventory = await FlightInventory.findOne({
        where: { flightId, date }
      });

      if (existingInventory) {
        return res.status(400).json({
          success: false,
          message: 'Bu tarih için inventory zaten mevcut'
        });
      }

      // Inventory oluştur
      const inventory = await FlightInventory.create({
        flightId,
        date,
        totalSeats: totalSeats || flight.totalSeats,
        availableSeats: totalSeats || flight.totalSeats,
        bookedSeats: 0,
        basePrice: basePrice || flight.basePrice || 500,
        status: 'available'
      });

      res.status(201).json({
        success: true,
        message: 'Uçuş inventory oluşturuldu',
        data: inventory
      });
    } catch (error) {
      console.error('Admin create inventory error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Admin: Tüm uçuşları listele (pagination ile)
  async getAllFlights(req, res) {
    try {
      const { page = 1, limit = 20, status, airline } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (status) where.status = status;
      if (airline) where.airline = airline;

      const { count, rows } = await Flight.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: FlightInventory,
            as: 'inventories',
            required: false
          }
        ]
      });

      res.status(200).json({
        success: true,
        data: {
          flights: rows,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(count / limit)
          }
        }
      });
    } catch (error) {
      console.error('Admin get all flights error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Admin: Uçuş güncelle
  async updateFlight(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const flight = await Flight.findByPk(id);
      if (!flight) {
        return res.status(404).json({
          success: false,
          message: 'Uçuş bulunamadı'
        });
      }

      await flight.update(updates);

      res.status(200).json({
        success: true,
        message: 'Uçuş güncellendi',
        data: flight
      });
    } catch (error) {
      console.error('Admin update flight error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Admin: Uçuş sil
  async deleteFlight(req, res) {
    try {
      const { id } = req.params;

      const flight = await Flight.findByPk(id);
      if (!flight) {
        return res.status(404).json({
          success: false,
          message: 'Uçuş bulunamadı'
        });
      }

      // İlişkili inventoryleri sil
      await FlightInventory.destroy({ where: { flightId: id } });

      // Uçuşu sil
      await flight.destroy();

      res.status(200).json({
        success: true,
        message: 'Uçuş silindi'
      });
    } catch (error) {
      console.error('Admin delete flight error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Admin: Uçuş durumunu güncelle
  async updateFlightStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const validStatuses = ['scheduled', 'delayed', 'cancelled', 'completed'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Geçersiz durum değeri'
        });
      }

      const flight = await Flight.findByPk(id);
      if (!flight) {
        return res.status(404).json({
          success: false,
          message: 'Uçuş bulunamadı'
        });
      }

      await flight.update({ status });

      res.status(200).json({
        success: true,
        message: 'Uçuş durumu güncellendi',
        data: flight
      });
    } catch (error) {
      console.error('Admin update flight status error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Admin: Havaalanı ekle
  async createAirport(req, res) {
    try {
      const { code, name, city, country, timezone, latitude, longitude } = req.body;

      if (!code || !name || !city || !country) {
        return res.status(400).json({
          success: false,
          message: 'Gerekli alanlar eksik'
        });
      }

      const airport = await Airport.create({
        code: code.toUpperCase(),
        name,
        city,
        country,
        timezone,
        latitude,
        longitude,
        active: true
      });

      res.status(201).json({
        success: true,
        message: 'Havaalanı oluşturuldu',
        data: airport
      });
    } catch (error) {
      console.error('Admin create airport error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Admin: Tüm havaalanlarını listele
  async getAllAirports(req, res) {
    try {
      const airports = await Airport.findAll({
        order: [['code', 'ASC']]
      });

      res.status(200).json({
        success: true,
        data: airports
      });
    } catch (error) {
      console.error('Admin get airports error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new AdminFlightController();
