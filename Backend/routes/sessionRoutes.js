const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const diyChatController=require('../controllers/diyChatController')
const intentChatController=require("../controllers/intentChatController")
const { saveDiyOutcomeToSession } = require('../controllers/diyOutcomeController');
const { createDiyChat } = require('../controllers/diyChatController');
 
const {
  generateQueryId,
  persistCurrentIntent,
  saveCurrentIntent
} = require('../controllers/intentController');
 
 
 
const multer = require('multer');
 
 
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });
 
router.post('/create', sessionController.createSession);
router.get('/:id', sessionController.getSession);
router.get('/user/:userId', sessionController.getOrCreateSessionByUserId);
router.post('/save-outcome', saveDiyOutcomeToSession);
router.post('/:sessionId/current-intent', saveCurrentIntent);
router.post('/:chat_id/save-current-intent', persistCurrentIntent);
router.put('/:id/sector', sessionController.setSector);
router.put('/:id/service', sessionController.setService);
router.put('/:id/intent-label', sessionController.setIntentLabel);
router.post('/:sessionId/save-diy-outcome', sessionController.saveDiyOutcome);
router.get('/diy-outcomes/:chat_id', sessionController.getDiyOutcomeByChatId);
router.post('/diy-outcome/quetion', sessionController.saveDiyOutcomeAnswer);
router.post('/intent-question', upload.single('file'), sessionController.saveIntentQuestion);
// DIY Outcome routes
router.get('/diy-outcome/:chat_id', sessionController.getDiyOutcomeByQueryId); // ?query_id=
router.get('/all-diy-outcomes/:chat_id', sessionController.getAllDiyOutcomes);
 
// ✅ NEW: submit endpoint (persists isCompleted = true)
const { submitDiyOutcome } = require('../controllers/diyOutcomeController');
router.post('/diy-outcome/submit', submitDiyOutcome);
 
// Intent routes
router.get('/intent/:chat_id', sessionController.getIntentByChatId); // ?query_id=
router.post('/intent-chat/:chat_id/store-ai-file', sessionController.storeAiFileInIntentChat)
 
 
router.post('/diy-chat/:chat_id/store-ai-file', sessionController.storeAiFileInDiyChat);
 
 
 
router.get('/diy-chat/:chat_id/status', diyChatController.getDiyChatStatus);
// routes/intentChat.js
router.get('/intent-chat/:chat_id/status', intentChatController.getIntentChatStatus);
 
 
router.get('/diy-chats', diyChatController.getAllDiyChats);
router.get('/intent-chats', intentChatController.getAllIntentChats);
 
// routes/chatRoutes.js or inside your existing router
router.get('/chat/status', sessionController.getChatStatus);
 
 
// routes/diyChat.js
 
const DiyChat = require('../models/DiyChat');
 
router.get('/diy-progress-percentage/:chat_id', async (req, res) => {
  const { chat_id } = req.params;
 
  try {
    const chat = await DiyChat.findOne({ chat_id });
 
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }
 
    const outcomes = chat.generated_outcomes;
 
    if (!outcomes || outcomes.length === 0) {
      return res.json({ success: true, progress: 0 });
    }
 
    let totalSteps = 0;
    let completedSteps = 0;
 
    outcomes.forEach(outcome => {
      if (Array.isArray(outcome.progress)) {
        outcome.progress.forEach(step => {
          totalSteps++;
          if (step.status) completedSteps++;
        });
      }
    });
 
    const percentage = totalSteps === 0 ? 0 : Math.round((completedSteps / totalSteps) * 100);
 
    return res.json({ success: true, progress: percentage });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});
 
 
 
const IntentChat = require('../models/IntentChat');
 
 
 
router.get('/intent-progress-percentage/:chat_id', async (req, res) => {
  const { chat_id } = req.params;
 
  try {
    const chat = await IntentChat.findOne({ chat_id });
 
    if (!chat) {
      return res.status(404).json({ success: false, message: 'IntentChat not found' });
    }
 
    const progress = chat.intent?.progress;
 
    if (!Array.isArray(progress) || progress.length === 0) {
      return res.json({ success: true, progress: 0 });
    }
 
    const totalSteps = progress.length;
    const completedSteps = progress.filter(step => step.status).length;
 
    const percentage = Math.round((completedSteps / totalSteps) * 100);
 
    return res.json({
      success: true,
      progress: percentage,
      completedSteps,
      totalSteps
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});
router.post('/diy-chats', createDiyChat);
module.exports = router;