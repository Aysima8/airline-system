const express = require('express');
const router = express.Router();
const flightController = require('../controllers/flight.controller');
const searchController = require('../controllers/search.controller');

// Arama endpoint'i
router.get('/search', searchController.searchFlights);

// Popular routes (for cache)
router.get('/popular-routes', searchController.getPopularRoutes);

// CRUD işlemleri
router.get('/', flightController.getAllFlights);
router.get('/:id', flightController.getFlightById);
router.post('/', flightController.createFlight);
router.put('/:id', flightController.updateFlight);
router.delete('/:id', flightController.deleteFlight);

// Seat update (for ticket service)
router.patch('/:id/seats', flightController.updateSeats);

module.exports = router;
