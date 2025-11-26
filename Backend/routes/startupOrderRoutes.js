const express = require('express');
const router = express.Router();
const startupOrderController = require('../controllers/startupOrderController');

/**
 * @swagger
 * /api/startup-orders/store:
 *   post:
 *     summary: Gathers and stores all data for a startup order.
 *     tags: [StartupOrder]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               order_id:
 *                 type: string
 *                 description: The unique order ID from the startup answers flow.
 *               chat_id:
 *                 type: string
 *                 description: The chat ID from the DIY outcomes flow.
 *             required:
 *               - order_id
 *               - chat_id
 *     responses:
 *       200:
 *         description: Startup order data stored successfully.
 *       400:
 *         description: Bad request, missing parameters.
 *       404:
 *         description: Related data not found.
 *       500:
 *         description: Internal server error.
 */
router.post('/store', startupOrderController.storeStartupOrder);

module.exports = router;
