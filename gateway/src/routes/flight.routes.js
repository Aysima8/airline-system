const express = require('express');
const router = express.Router();
const proxy = require('../utils/proxy');
const authMiddleware = require('../middlewares/auth.middleware');
const { requireAdmin } = require('../middlewares/role.middleware');
const { FLIGHT_SERVICE_URL } = require('../config/services');

/**
 * @swagger
 * /api/v1/flights/search:
 *   get:
 *     summary: Search flights
 *     tags: [Flights]
 *     parameters:
 *       - in: query
 *         name: origin
 *         schema:
 *           type: string
 *         example: IST
 *       - in: query
 *         name: destination
 *         schema:
 *           type: string
 *         example: JFK
 *       - in: query
 *         name: departureDate
 *         schema:
 *           type: string
 *           format: date
 *         example: 2026-02-15
 *     responses:
 *       200:
 *         description: List of flights
 */
// Uçuş arama - herkes erişebilir (auth gerekmez)
// Supports: from, to, date, pax, flex, direct, page, pageSize
router.get('/search', (req, res) => {
  proxy(req, res, FLIGHT_SERVICE_URL);
});

/**
 * @swagger
 * /api/v1/flights/popular-routes:
 *   get:
 *     summary: Get popular routes (cached)
 *     tags: [Flights]
 *     responses:
 *       200:
 *         description: List of popular routes
 */
router.get('/popular-routes', (req, res) => {
  proxy(req, res, FLIGHT_SERVICE_URL);
});

/**
 * @swagger
 * /api/v1/flights:
 *   get:
 *     summary: List all flights
 *     tags: [Flights]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of flights
 */
router.get('/', (req, res) => {
  proxy(req, res, FLIGHT_SERVICE_URL);
});

/**
 * @swagger
 * /api/v1/flights/{id}:
 *   get:
 *     summary: Get flight details
 *     tags: [Flights]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Flight ID
 *     responses:
 *       200:
 *         description: Flight details
 *       404:
 *         description: Flight not found
 */
router.get('/:id', (req, res) => {
  proxy(req, res, FLIGHT_SERVICE_URL);
});

/**
 * @swagger
 * /api/v1/flights:
 *   post:
 *     summary: Add new flight (ADMIN only)
 *     tags: [Flights]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - flightNumber
 *               - origin
 *               - destination
 *               - departureTime
 *               - arrivalTime
 *               - price
 *               - capacity
 *             properties:
 *               flightNumber:
 *                 type: string
 *                 example: TK001
 *               origin:
 *                 type: string
 *                 example: IST
 *               destination:
 *                 type: string
 *                 example: JFK
 *               departureTime:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-02-15T10:00:00Z
 *               arrivalTime:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-02-15T14:00:00Z
 *               price:
 *                 type: number
 *                 example: 500
 *               capacity:
 *                 type: integer
 *                 example: 200
 *     responses:
 *       201:
 *         description: Flight added successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
router.post('/', authMiddleware, requireAdmin, (req, res) => {
  proxy(req, res, FLIGHT_SERVICE_URL);
});

/**
 * @swagger
 * /api/v1/flights/{id}:
 *   put:
 *     summary: Update flight (ADMIN only)
 *     tags: [Flights]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Flight ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               price:
 *                 type: number
 *               capacity:
 *                 type: integer
 *               departureTime:
 *                 type: string
 *                 format: date-time
 *               arrivalTime:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Flight updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Flight not found
 */
router.put('/:id', authMiddleware, requireAdmin, (req, res) => {
  proxy(req, res, FLIGHT_SERVICE_URL);
});

/**
 * @swagger
 * /api/v1/flights/{id}:
 *   delete:
 *     summary: Delete flight (ADMIN only)
 *     tags: [Flights]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Flight ID
 *     responses:
 *       200:
 *         description: Flight deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Flight not found
 */
router.delete('/:id', authMiddleware, requireAdmin, (req, res) => {
  proxy(req, res, FLIGHT_SERVICE_URL);
});

module.exports = router;
