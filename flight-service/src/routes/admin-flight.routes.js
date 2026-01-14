const express = require('express');
const router = express.Router();
const adminFlightController = require('../controllers/admin-flight.controller');

// Flight Management
router.post('/flights', adminFlightController.createFlight);
router.get('/flights', adminFlightController.getAllFlights);
router.get('/flights/:id', adminFlightController.updateFlight);
router.put('/flights/:id', adminFlightController.updateFlight);
router.delete('/flights/:id', adminFlightController.deleteFlight);
router.patch('/flights/:id/status', adminFlightController.updateFlightStatus);

// Flight Inventory Management
router.post('/flights/:flightId/inventory', adminFlightController.createFlightInventory);

// Airport Management
router.post('/airports', adminFlightController.createAirport);
router.get('/airports', adminFlightController.getAllAirports);

module.exports = router;
