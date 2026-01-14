const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticket.controller');

// Bilet işlemleri
router.post('/buy', ticketController.purchaseTicket);
router.get('/user', ticketController.getUserTickets);
router.get('/completed', ticketController.getCompletedTickets);
router.get('/:id', ticketController.getTicketById);
router.delete('/:id', ticketController.cancelTicket);

module.exports = router;
