// routes/startupAnswersRoutes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/startupAnswersController');

// create a new order for a user (firebase uid)
// POST /api/startup/orders  body: { userId, sessionId? }
router.post('/orders', ctrl.createOrder);

// replace entire answers array (0..42)
router.put('/orders/:orderId/answers', ctrl.replaceAnswers);

// upsert single answer by id
router.patch('/orders/:orderId/answers', ctrl.upsertSingleAnswer);

// get ML payload in exact format
router.get('/orders/:orderId/payload', ctrl.getMlPayload);

module.exports = router;
