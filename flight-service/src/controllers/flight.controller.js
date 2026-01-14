const flightService = require('../services/flight.service');

class FlightController {
  // Tüm uçuşları getir (with pagination)
  async getAllFlights(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 10;

      const result = await flightService.getAllFlights(page, pageSize);

      res.status(200).json({
        success: true,
        data: result.flights,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // ID ile uçuş getir
  async getFlightById(req, res) {
    try {
      const flight = await flightService.getFlightById(req.params.id);
      if (!flight) {
        return res.status(404).json({
          success: false,
          message: 'Uçuş bulunamadı'
        });
      }
      res.status(200).json({
        success: true,
        data: flight
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Yeni uçuş oluştur
  async createFlight(req, res) {
    try {
      const flight = await flightService.createFlight(req.body);
      res.status(201).json({
        success: true,
        data: flight
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Uçuş güncelle
  async updateFlight(req, res) {
    try {
      const flight = await flightService.updateFlight(req.params.id, req.body);
      if (!flight) {
        return res.status(404).json({
          success: false,
          message: 'Uçuş bulunamadı'
        });
      }
      res.status(200).json({
        success: true,
        data: flight
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Uçuş sil
  async deleteFlight(req, res) {
    try {
      await flightService.deleteFlight(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Uçuş silindi'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Advanced search with flexible date, direct filter, pagination
  async searchFlights(req, res) {
    try {
      const {
        from,
        to,
        date,
        pax = 1,
        flex = 0,
        direct = 'false',
        page = 1,
        pageSize = 10
      } = req.query;

      // Validation
      if (!from || !to || !date) {
        return res.status(400).json({
          success: false,
          message: 'from, to, date parametreleri gerekli'
        });
      }

      // Parse parameters
      const passengers = parseInt(pax);
      const flexDays = parseInt(flex);
      const directOnly = direct === 'true';
      const pageNum = parseInt(page);
      const pageSizeNum = parseInt(pageSize);

      // Validate date format
      const searchDate = new Date(date);
      if (isNaN(searchDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Geçersiz tarih formatı (YYYY-MM-DD kullanın)'
        });
      }

      const result = await flightService.advancedSearchFlights({
        origin: from,
        destination: to,
        date: searchDate,
        passengers,
        flexDays,
        directOnly,
        page: pageNum,
        pageSize: pageSizeNum
      });

      res.status(200).json({
        success: true,
        data: result.flights,
        pagination: result.pagination,
        filters: {
          origin: from.toUpperCase(),
          destination: to.toUpperCase(),
          date: date,
          passengers,
          flexibleDays: flexDays,
          directOnly
        }
      });
    } catch (error) {
      console.error('Flight search error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get popular routes (for cache)
  async getPopularRoutes(req, res) {
    try {
      const limit = parseInt(req.query.limit || 10);
      const routes = await flightService.getPopularRoutes(limit);

      res.status(200).json({
        success: true,
        data: routes
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update flight seats (for ticket service)
  async updateSeats(req, res) {
    try {
      const { id } = req.params;
      const { seats } = req.body;

      if (!seats || isNaN(seats)) {
        return res.status(400).json({
          success: false,
          message: 'Geçersiz koltuk sayısı'
        });
      }

      const flight = await flightService.updateSeats(id, parseInt(seats));

      if (!flight) {
        return res.status(404).json({
          success: false,
          message: 'Uçuş bulunamadı'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Koltuk sayısı güncellendi',
        data: {
          id: flight.id,
          availableSeats: flight.availableSeats
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new FlightController();
