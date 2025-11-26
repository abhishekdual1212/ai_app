const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController'); // update path as needed
const IntentChat = require('../models/IntentChat');
const DiyChat = require('../models/DiyChat');
router.get('/:sessionId/all-chats', dashboardController.getAllChatsBySessionId);


router.get('/chat-progress/', async (req, res) => {
  const { type, chat_id } = req.query;

  console.log(type),"these is type"

  if (!type || !chat_id) {
    return res.status(400).json({
      success: false,
      message: 'Missing required query parameters: type and chat_id'
    });
  }

  try {
    let totalSteps = 0;
    let completedSteps = 0;
    let source = '';

    switch (type) {
      case 'diy': {
        const chat = await DiyChat.findOne({ chat_id });
        if (!chat) {
          return res.status(404).json({ success: false, message: 'DIY Chat not found' });
        }
        const outcomes = chat.generated_outcomes;
        if (!outcomes || outcomes.length === 0) {
          return res.json({ success: true, progress: 0, source: 'diy' });
        }
        outcomes.forEach(outcome => {
          if (Array.isArray(outcome.progress)) {
            outcome.progress.forEach(step => {
              totalSteps++;
              if (step.status) completedSteps++;
            });
          }
        });
        source = 'diy';
        break;
      }
      case 'intent': {
        const chat = await IntentChat.findOne({ chat_id });
        if (!chat) {
          return res.status(404).json({ success: false, message: 'Intent Chat not found' });
        }
        const progress = chat.intent?.progress;
        if (!Array.isArray(progress) || progress.length === 0) {
          return res.json({ success: true, progress: 0, source: 'intent' });
        }
        totalSteps = progress.length;
        completedSteps = progress.filter(step => step.status).length;
        source = 'intent';
        break;
      }
      // You could add a 'static' case here if needed, or just handle it as a default.
      default:
        // For 'static' or any other type, you might want to return 0 progress or a specific message.
      return res.status(400).json({
        success: false,
        message: 'Invalid type. Must be "diy" or "intent".'
      });
    }

    const percentage = totalSteps === 0 ? 0 : Math.round((completedSteps / totalSteps) * 100);

    return res.json({
      success: true,
      type: source,
      progress: percentage,
      completedSteps,
      totalSteps
    });
  } catch (err) {
    console.error('Error calculating chat progress:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});




module.exports = router;
