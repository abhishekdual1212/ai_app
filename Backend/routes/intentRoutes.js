const express = require('express');
const router = express.Router();
const intentController = require('../controllers/intentController');
const { LegalCatalog } = require('../models/LegalCatalog');

router.get('/questions', async (req, res) => {
  const { intentName } = req.query;

  if (!intentName) {
    return res.status(400).json({ error: 'Please provide intentName in query' });
  }

  try {
    const catalogs = await LegalCatalog.find({});

    for (const catalog of catalogs) {
      for (const service of catalog.services || []) {
        for (const intent of service.intents || []) {
          if (intent.name.trim().toLowerCase() === intentName.trim().toLowerCase()) {
            return res.json({
              intentName: intent.name,
              questions: intent.questions || []
            });
          }
        }
      }
    }

    return res.status(404).json({ error: `Intent "${intentName}" not found.` });
  } catch (err) {
    console.error('Error fetching questions:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:intentName/price', intentController.getPriceByIntentName);

module.exports = router;
