const flightRepository = require('../repositories/flight.repository');
const priceService = require('./price.service');
const airportCache = require('../cache/airport.cache');
const routesCache = require('../cache/routes.cache');

class FlightService {
  // Tüm uçuşları getir (with pagination)
  async getAllFlights(page = 1, pageSize = 10) {
    const result = await flightRepository.findAll(page, pageSize);
    return {
      flights: result.flights,
      pagination: {
        total: result.total,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        totalPages: Math.ceil(result.total / pageSize)
      }
    };
  }

  // ID ile uçuş getir
  async getFlightById(id) {
    const flight = await flightRepository.findById(id);
    return flight;
  }

  // Uçuş ara + kapasite kontrolü
  async searchFlights({ origin, destination, date, passengers }) {
    // Cache'den havaalanı bilgilerini kontrol et
    await airportCache.warmUp();

    const flights = await flightRepository.search({
      origin,
      destination,
      date
    });

    // Kapasite kontrolü yap
    const availableFlights = flights.filter(flight => {
      return flight.availableSeats >= passengers;
    });

    // Fiyat hesapla (ML servis çağrısı)
    const flightsWithPrices = await Promise.all(
      availableFlights.map(async (flight) => {
        const price = await priceService.calculatePrice(flight, passengers);
        return {
          ...flight,
          price,
          passengers
        };
      })
    );

    return flightsWithPrices;
  }

  // Yeni uçuş oluştur
  async createFlight(flightData) {
    const flight = await flightRepository.create(flightData);
    return flight;
  }

  // Uçuş güncelle
  async updateFlight(id, flightData) {
    const flight = await flightRepository.update(id, flightData);
    return flight;
  }

  // Uçuş sil
  async deleteFlight(id) {
    await flightRepository.delete(id);
  }

  // Advanced search with flexible date and filters
  async advancedSearchFlights({ origin, destination, date, passengers, flexDays = 0, directOnly = false, page = 1, pageSize = 10 }) {
    // Cache'den havaalanı bilgilerini kontrol et
    await airportCache.warmUp();

    // Repository'den advanced search
    const { flights, pagination } = await flightRepository.advancedSearch({
      origin,
      destination,
      date,
      flexDays,
      directOnly,
      page,
      pageSize
    });

    // Kapasite kontrolü yap
    const availableFlights = flights.filter(flight => {
      return flight.availableSeats >= passengers;
    });

    // Fiyat hesapla (ML servis çağrısı)
    const flightsWithPrices = await Promise.all(
      availableFlights.map(async (flight) => {
        try {
          const price = await priceService.calculatePrice(flight, passengers);
          return {
            id: flight.id,
            flightNumber: flight.flightNumber,
            airline: flight.airline,
            origin: flight.origin,
            destination: flight.destination,
            departureTime: flight.departureTime,
            arrivalTime: flight.arrivalTime,
            duration: flight.duration,
            availableSeats: flight.availableSeats,
            totalSeats: flight.totalSeats,
            basePrice: flight.basePrice,
            calculatedPrice: price,
            passengers,
            isDirect: true // Placeholder - can be enhanced
          };
        } catch (error) {
          console.error(`Price calculation error for flight ${flight.id}:`, error);
          return {
            id: flight.id,
            flightNumber: flight.flightNumber,
            airline: flight.airline,
            origin: flight.origin,
            destination: flight.destination,
            departureTime: flight.departureTime,
            arrivalTime: flight.arrivalTime,
            duration: flight.duration,
            availableSeats: flight.availableSeats,
            totalSeats: flight.totalSeats,
            basePrice: flight.basePrice,
            calculatedPrice: flight.basePrice || 500,
            passengers,
            isDirect: true
          };
        }
      })
    );

    return {
      flights: flightsWithPrices,
      pagination: {
        ...pagination,
        returned: flightsWithPrices.length
      }
    };
  }

  // Get popular routes (from cache)
  async getPopularRoutes(limit = 10) {
    // Try cache first
    const cached = await routesCache.getPopularRoutes();
    if (cached && cached.length > 0) {
      return cached.slice(0, limit);
    }

    // Fallback to database
    return await flightRepository.getPopularRoutes(limit);
  }

  // Update flight seats (for ticket purchase)
  async updateSeats(flightId, seats) {
    return await flightRepository.updateAvailableSeats(flightId, seats);
  }
}

module.exports = new FlightService();
