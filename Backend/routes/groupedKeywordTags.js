const express = require('express');
const router = express.Router();
const GroupedKeywordTag = require('../models/GroupedKeywordTag');

// GET /api/grouped-keyword-tags/:questionNumber
router.get('/:questionNumber', async (req, res) => {
  try {
    const questionNumber = parseInt(req.params.questionNumber, 10);

    if (isNaN(questionNumber)) {
      return res.status(400).json({ error: 'Invalid question number' });
    }

    const result = await GroupedKeywordTag.findOne({ questionNumber });

    if (!result) {
      return res.status(404).json({ message: 'No tags found for this question' });
    }

    res.json(result);
  } catch (err) {
    console.error('❌ Error fetching grouped tags:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
