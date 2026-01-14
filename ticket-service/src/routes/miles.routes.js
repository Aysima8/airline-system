const express = require('express');
const router = express.Router();
const milesController = require('../controllers/miles.controller');

// Miles işlemleri
router.post('/add', milesController.addMiles);
router.get('/me', milesController.getUserMiles);

module.exports = router;
