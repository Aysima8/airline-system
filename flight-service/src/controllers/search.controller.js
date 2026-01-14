const flightService = require('../services/flight.service');

class SearchController {
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

      // Backward compatibility: support both 'from/to' and 'origin/destination'
      const origin = from || req.query.origin;
      const destination = to || req.query.destination;
      const passengers = parseInt(req.query.passengers || pax);

      // Validation
      if (!origin || !destination || !date) {
        return res.status(400).json({
          success: false,
          message: 'from/origin, to/destination, date parametreleri gerekli'
        });
      }

      // Parse parameters
      const flexDays = parseInt(flex);
      const directOnly = direct === 'true';
      const pageNum = parseInt(page);
      const pageSizeNum = parseInt(pageSize);

      // Normalize date format: "21.01.2026" -> "2026-01-21"
      let normalizedDate = date;
      if (/^\d{2}\.\d{2}\.\d{4}$/.test(date)) {
        const [dd, mm, yyyy] = date.split('.');
        normalizedDate = `${yyyy}-${mm}-${dd}`;
      }

      // Validate date format
      const searchDate = new Date(normalizedDate);
      if (isNaN(searchDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Geçersiz tarih formatı (YYYY-MM-DD kullanın)'
        });
      }

      // Validate pagination
      if (pageNum < 1 || pageSizeNum < 1 || pageSizeNum > 100) {
        return res.status(400).json({
          success: false,
          message: 'Geçersiz pagination parametreleri (page >= 1, 1 <= pageSize <= 100)'
        });
      }

      const result = await flightService.advancedSearchFlights({
        origin,
        destination,
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
          origin: origin.toUpperCase(),
          destination: destination.toUpperCase(),
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
}

module.exports = new SearchController();
