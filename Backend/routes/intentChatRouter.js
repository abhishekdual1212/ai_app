const express = require('express');
const router = express.Router();
const controller = require('../controllers/intentChatController');





router.patch('/update-chat-status', controller.updateChatStatus);
router.patch('/update-progress-status', controller.updateProgressStatus);



module.exports = router;