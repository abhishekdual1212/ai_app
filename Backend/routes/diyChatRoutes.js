const express = require('express');
const router = express.Router();
const controller = require('../controllers/diyChatController');


router.patch('/update-status', controller.updateDiyChatStatus);

router.patch('/update-outcome-progress', controller.updateDiyProgressStatus);

module.exports = router;
