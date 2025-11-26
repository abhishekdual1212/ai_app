const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');



router.post('/create', documentController.createDocument);
router.post('/quick-generate', documentController.quickGenerate);
router.get('/:id/status', documentController.getDocumentStatus);

module.exports = router;
