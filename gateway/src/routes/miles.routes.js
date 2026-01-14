const express = require('express');
const router = express.Router();
const proxy = require('../utils/proxy');
const authMiddleware = require('../middlewares/auth.middleware');
const { requireService } = require('../middlewares/role.middleware');
const { TICKET_SERVICE_URL } = require('../config/services');

/**
 * @swagger
 * /api/v1/miles/me:
 *   get:
 *     summary: Get user's miles information
 *     tags: [Miles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's miles information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                     totalMiles:
 *                       type: integer
 *                       example: 1500
 *                     tier:
 *                       type: string
 *                       example: Gold
 *       401:
 *         description: Unauthorized
 */
router.get('/me', authMiddleware, (req, res) => {
  proxy(req, res, TICKET_SERVICE_URL);
});

/**
 * @swagger
 * /api/v1/miles/add:
 *   post:
 *     summary: Add miles (SERVICE role required)
 *     tags: [Miles]
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
 *                 example: 250
 *               reason:
 *                 type: string
 *                 example: Flight completion
 *     responses:
 *       200:
 *         description: Miles added successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - SERVICE role required
 */
router.post('/add', authMiddleware, requireService, (req, res) => {
  proxy(req, res, TICKET_SERVICE_URL);
});

module.exports = router;
