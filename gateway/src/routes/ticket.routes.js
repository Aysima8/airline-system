const express = require('express');
const router = express.Router();
const proxy = require('../utils/proxy');
const authMiddleware = require('../middlewares/auth.middleware');
const { TICKET_SERVICE_URL } = require('../config/services');

/**
 * @swagger
 * /api/v1/tickets/buy:
 *   post:
 *     summary: Buy a ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - flightId
 *               - passengerName
 *               - passengerEmail
 *             properties:
 *               flightId:
 *                 type: integer
 *                 example: 1
 *               passengerName:
 *                 type: string
 *                 example: John Doe
 *               passengerEmail:
 *                 type: string
 *                 example: john@example.com
 *               seatNumber:
 *                 type: string
 *                 example: 12A
 *     responses:
 *       201:
 *         description: Ticket purchased successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/buy', authMiddleware, (req, res) => {
  proxy(req, res, TICKET_SERVICE_URL);
});

/**
 * @swagger
 * /api/v1/tickets/user:
 *   get:
 *     summary: Get user's tickets
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's tickets
 *       401:
 *         description: Unauthorized
 */
router.get('/user', authMiddleware, (req, res) => {
  proxy(req, res, TICKET_SERVICE_URL);
});

/**
 * @swagger
 * /api/v1/tickets/{id}:
 *   get:
 *     summary: Get ticket details
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Ticket ID
 *     responses:
 *       200:
 *         description: Ticket details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Ticket not found
 */
router.get('/:id', authMiddleware, (req, res) => {
  proxy(req, res, TICKET_SERVICE_URL);
});

/**
 * @swagger
 * /api/v1/tickets/{id}:
 *   delete:
 *     summary: Cancel ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Ticket ID
 *     responses:
 *       200:
 *         description: Ticket cancelled successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Ticket not found
 */
router.delete('/:id', authMiddleware, (req, res) => {
  proxy(req, res, TICKET_SERVICE_URL);
});

/**
 * @swagger
 * /api/v1/tickets/miles/add:
 *   post:
 *     summary: Add miles (SERVICE role)
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - miles
 *             properties:
 *               userId:
 *                 type: string
 *                 example: user-123
 *               miles:
 *                 type: integer
 *                 example: 500
 *     responses:
 *       200:
 *         description: Miles added successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/miles/add', authMiddleware, (req, res) => {
  // SERVICE role kontrolü yapılabilir ama şimdilik auth yeterli
  proxy(req, res, TICKET_SERVICE_URL);
});

module.exports = router;
