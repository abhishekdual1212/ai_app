// controllers/startupAnswersController.js
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const StartupAnswer = require('../models/StartupAnswer');
const User = require('../models/User');
const UserSession = require('../models/UserSession');

/**
 * POST /api/startup/orders
 * Body: { userId: "<firebase uid>", sessionId?: "<mongo id>" }
 * Creates a new "order" (UUID) for a user. Answers start empty.
 */
exports.createOrder = async (req, res) => {
  try {
    const { userId, sessionId } = req.body;

    if (!userId || typeof userId !== 'string' || !userId.trim()) {
      return res.status(400).json({ success: false, message: 'userId (firebase uid) is required' });
    }

    const user = await User.findOne({ firebase_uid: userId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let sessionRef;
    if (sessionId) {
      if (!mongoose.Types.ObjectId.isValid(sessionId)) {
        return res.status(400).json({ success: false, message: 'Invalid sessionId' });
      }
      const session = await UserSession.findById(sessionId);
      if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
      sessionRef = session._id;
    }

    const order_id = uuidv4();

    await StartupAnswer.create({
      order_id,
      userId,
      sessionId: sessionRef,
      user_type: 'startup', // hardcoded
      answers: []
    });

    return res.status(201).json({ success: true, data: { order_id } });
  } catch (err) {
    console.error('createOrder error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * PUT /api/startup/orders/:orderId/answers
 * Body: { answers: [{ id: <number|string>, text: <string> }, ...] } // 0..42 items
 * Replaces all answers for an order. Extra fields are stripped; only {id, text} persist.
 */
exports.replaceAnswers = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { answers } = req.body;

    if (!Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: 'answers must be an array' });
    }
    if (answers.length > 42) {
      return res.status(400).json({ success: false, message: 'answers cannot exceed 42 entries' });
    }

    for (const a of answers) {
      if (a == null || !('id' in a) || !('text' in a)) {
        return res.status(400).json({ success: false, message: 'each answer must have id and text' });
      }
    }

    // Keep only the exact keys the ML model expects
    const normalized = answers.map(a => ({ id: a.id, text: a.text }));

    const doc = await StartupAnswer.findOneAndUpdate(
      { order_id: orderId },
      { $set: { answers: normalized } },
      { new: true }
    );
    if (!doc) return res.status(404).json({ success: false, message: 'Order not found' });

    return res.json({ success: true, data: { order_id: doc.order_id, count: doc.answers.length } });
  } catch (err) {
    console.error('replaceAnswers error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * PATCH /api/startup/orders/:orderId/answers
 * Body: { id: <number|string>, text: <string> }
 * Upserts a single answer (by id). Preserves the type of `id` you send.
 */
exports.upsertSingleAnswer = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { id, text } = req.body;

    if (!('id' in req.body) || !('text' in req.body)) {
      return res.status(400).json({ success: false, message: 'id and text are required' });
    }

    const doc = await StartupAnswer.findOne({ order_id: orderId });
    if (!doc) return res.status(404).json({ success: false, message: 'Order not found' });

    const sameId = (a, b) => String(a) === String(b);
    const idx = doc.answers.findIndex(a => sameId(a.id, id));

    if (idx >= 0) {
      // Update text; keep original id and its type intact
      doc.answers[idx] = { id: doc.answers[idx].id, text };
    } else {
      if (doc.answers.length >= 42) {
        return res.status(400).json({ success: false, message: 'answers cannot exceed 42 entries' });
      }
      // Store only the exact keys
      doc.answers.push({ id, text });
    }

    await doc.save();
    return res.json({ success: true, data: { order_id: doc.order_id, count: doc.answers.length } });
  } catch (err) {
    console.error('upsertSingleAnswer error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * GET /api/startup/orders/:orderId/payload
 * Returns the exact ML payload shape:
 * { "user_type": "startup", "answers": [ { "id": <number|string>, "text": "<string>" }, ... ] }
 */
exports.getMlPayload = async (req, res) => {
  try {
    const { orderId } = req.params;

    const doc = await StartupAnswer.findOne(
      { order_id: orderId },
      { _id: 0, user_type: 1, answers: 1 }
    );

    if (!doc) return res.status(404).json({ success: false, message: 'Order not found' });

    // Return ONLY the exact ML payload (no wrapper)
    return res.json({
      user_type: 'startup', // hardcode per requirement
      answers: (doc.answers || []).map(a => ({ id: a.id, text: a.text }))
    });
  } catch (err) {
    console.error('getMlPayload error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
