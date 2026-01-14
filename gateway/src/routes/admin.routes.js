const express = require('express');
const router = express.Router();
const axios = require('axios');
const authMiddleware = require('../middlewares/auth.middleware');
const { requireAdmin } = require('../middlewares/role.middleware');

const FLIGHT_SERVICE_URL = process.env.FLIGHT_SERVICE_URL || 'http://localhost:3002';

// Proxy helper
const proxy = async (req, res, targetUrl) => {
  try {
    const response = await axios({
      method: req.method,
      url: targetUrl + req.originalUrl.replace('/api/v1/admin', '/api/v1/admin'),
      data: req.body,
      params: req.query,
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': req.user?.id,
        'x-user-roles': JSON.stringify(req.user?.roles || [])
      }
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({
        success: false,
        message: 'Servis iletişim hatası'
      });
    }
  }
};

// ============================================
// ADMIN FLIGHT MANAGEMENT ROUTES
// Sadece ADMIN rolüne sahip kullanıcılar erişebilir
// ============================================

/**
 * @swagger
 * /api/v1/admin/flights:
 *   post:
 *     summary: Create new flight (ADMIN only)
 *     tags: [Admin]
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
 *                 example: TK002
 *               origin:
 *                 type: string
 *                 example: IST
 *               destination:
 *                 type: string
 *                 example: LHR
 *               departureTime:
 *                 type: string
 *                 format: date-time
 *               arrivalTime:
 *                 type: string
 *                 format: date-time
 *               price:
 *                 type: number
 *                 example: 450
 *               capacity:
 *                 type: integer
 *                 example: 180
 *     responses:
 *       201:
 *         description: Flight created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
router.post('/flights', authMiddleware, requireAdmin, (req, res) => {
  proxy(req, res, FLIGHT_SERVICE_URL);
});

/**
 * @swagger
 * /api/v1/admin/flights:
 *   get:
 *     summary: Get all flights (ADMIN view)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all flights
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
router.get('/flights', authMiddleware, requireAdmin, (req, res) => {
  proxy(req, res, FLIGHT_SERVICE_URL);
});

/**
 * @swagger
 * /api/v1/admin/flights/{id}:
 *   put:
 *     summary: Update flight (ADMIN only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
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
 *     responses:
 *       200:
 *         description: Flight updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
router.put('/flights/:id', authMiddleware, requireAdmin, (req, res) => {
  proxy(req, res, FLIGHT_SERVICE_URL);
});

/**
 * @swagger
 * /api/v1/admin/flights/{id}:
 *   delete:
 *     summary: Delete flight (ADMIN only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Flight deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
router.delete('/flights/:id', authMiddleware, requireAdmin, (req, res) => {
  proxy(req, res, FLIGHT_SERVICE_URL);
});

/**
 * @swagger
 * /api/v1/admin/flights/{id}/status:
 *   patch:
 *     summary: Update flight status (ADMIN only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [scheduled, boarding, departed, arrived, cancelled, delayed]
 *                 example: boarding
 *     responses:
 *       200:
 *         description: Flight status updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
router.patch('/flights/:id/status', authMiddleware, requireAdmin, (req, res) => {
  proxy(req, res, FLIGHT_SERVICE_URL);
});

/**
 * @swagger
 * /api/v1/admin/flights/{flightId}/inventory:
 *   post:
 *     summary: Create flight inventory (ADMIN only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: flightId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               availableSeats:
 *                 type: integer
 *                 example: 200
 *     responses:
 *       201:
 *         description: Inventory created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
router.post('/flights/:flightId/inventory', authMiddleware, requireAdmin, (req, res) => {
  proxy(req, res, FLIGHT_SERVICE_URL);
});

/**
 * @swagger
 * /api/v1/admin/airports:
 *   post:
 *     summary: Create airport (ADMIN only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - name
 *               - city
 *               - country
 *             properties:
 *               code:
 *                 type: string
 *                 example: IST
 *               name:
 *                 type: string
 *                 example: Istanbul Airport
 *               city:
 *                 type: string
 *                 example: Istanbul
 *               country:
 *                 type: string
 *                 example: Turkey
 *     responses:
 *       201:
 *         description: Airport created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
router.post('/airports', authMiddleware, requireAdmin, (req, res) => {
  proxy(req, res, FLIGHT_SERVICE_URL);
});

/**
 * @swagger
 * /api/v1/admin/airports:
 *   get:
 *     summary: List all airports (ADMIN only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of airports
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
router.get('/airports', authMiddleware, requireAdmin, (req, res) => {
  proxy(req, res, FLIGHT_SERVICE_URL);
});

module.exports = router;
