const axios = require('axios');

class PriceService {
  constructor() {
    // ML servis URL'i - env'den alınacak
    this.mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:5000';
  }

  // Helper: departure time mapping
  getDepartureTimeCode(departureTime) {
    const hour = new Date(departureTime).getHours();
    if (hour >= 0 && hour < 6) return 'Night';
    if (hour >= 6 && hour < 9) return 'Early_Morning';
    if (hour >= 9 && hour < 12) return 'Morning';
    if (hour >= 12 && hour < 18) return 'Afternoon';
    if (hour >= 18 && hour < 21) return 'Evening';
    return 'Night';
  }

  // Helper: arrival time mapping
  getArrivalTimeCode(arrivalTime) {
    const hour = new Date(arrivalTime).getHours();
    if (hour >= 0 && hour < 6) return 'Night';
    if (hour >= 6 && hour < 9) return 'Early_Morning';
    if (hour >= 9 && hour < 12) return 'Morning';
    if (hour >= 12 && hour < 18) return 'Afternoon';
    if (hour >= 18 && hour < 21) return 'Evening';
    return 'Night';
  }

  // Helper: calculate days left
  getDaysLeft(departureTime) {
    const now = new Date();
    const departure = new Date(departureTime);
    const diffTime = departure - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays); // Minimum 1 day
  }

  // Helper: calculate duration in hours
  getDuration(departureTime, arrivalTime) {
    const departure = new Date(departureTime);
    const arrival = new Date(arrivalTime);
    const diffMs = arrival - departure;
    const hours = diffMs / (1000 * 60 * 60);
    return Math.round(hours * 100) / 100;
  }

  // Helper: map city codes to names
  getCityName(code) {
    // Simple mapping - can be extended
    const cityMap = {
      'DEL': 'Delhi',
      'BOM': 'Mumbai',
      'IST': 'Istanbul',
      'ESB': 'Ankara',
      'AYT': 'Antalya',
      'IZM': 'Izmir'
    };
    return cityMap[code.toUpperCase()] || 'Delhi'; // Default to Delhi for Clean_Dataset
  }

  // ML servisi ile fiyat hesaplama (Clean_Dataset format)
  async calculatePrice(flight, passengers = 1) {
    try {
      // Flight object'inden ML input'u oluştur
      const mlInput = {
        airline: flight.airline || 'Indigo',
        source_city: this.getCityName(flight.origin),
        destination_city: this.getCityName(flight.destination),
        departure_time: this.getDepartureTimeCode(flight.departureTime),
        stops: 'zero', // Assuming direct flights, can be enhanced
        arrival_time: this.getArrivalTimeCode(flight.arrivalTime),
        flight_class: 'Economy', // Default to Economy
        duration: flight.duration || this.getDuration(flight.departureTime, flight.arrivalTime),
        days_left: this.getDaysLeft(flight.departureTime)
      };

      const response = await axios.post(`${this.mlServiceUrl}/predict`, mlInput, {
        timeout: 5000 // 5 second timeout
      });

      // ML price per passenger
      const mlPrice = response.data.price;

      // Apply passenger multiplier
      const totalPrice = mlPrice * passengers;

      // Apply occupancy adjustment
      const occupancyRate = (flight.totalSeats - flight.availableSeats) / flight.totalSeats;
      const demandFactor = 1 + (occupancyRate * 0.3); // Max 30% increase

      const finalPrice = totalPrice * demandFactor;

      return Math.round(finalPrice * 100) / 100;
    } catch (error) {
      console.error('ML servis hatası:', error.message);
      // ML servisi çalışmıyorsa, basit bir fiyat hesaplama
      return this.fallbackPriceCalculation(flight, passengers);
    }
  }

  // ML servisi olmadığında kullanılacak basit fiyat hesaplama
  fallbackPriceCalculation(flight, passengers) {
    // Use basePrice if available, otherwise calculate
    const basePrice = flight.basePrice || 5000;

    const occupancyRate = (flight.totalSeats - flight.availableSeats) / flight.totalSeats;
    const demandFactor = 1 + (occupancyRate * 0.5); // Max 50% increase

    // Days left factor - more expensive closer to departure
    const daysLeft = this.getDaysLeft(flight.departureTime);
    const urgencyFactor = daysLeft < 7 ? 1.3 : daysLeft < 14 ? 1.15 : 1.0;

    const totalPrice = basePrice * demandFactor * urgencyFactor * passengers;
    return Math.round(totalPrice * 100) / 100;
  }
}

module.exports = new PriceService();
