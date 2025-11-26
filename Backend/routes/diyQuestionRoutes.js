const express = require('express');
const router = express.Router();
const DiyQuestion = require('../models/DiyQuestion');
const GroupedKeywordTag = require('../models/GroupedKeywordTag'); // Import the model

// GET /api/diy-questions/:number
router.get('/:number', async (req, res) => {
  try {
    const questionNumber = parseInt(req.params.number, 10);
    if (isNaN(questionNumber)) {
      return res.status(400).json({ error: 'Invalid question number' });
    }

    // Fetch question
    const question = await DiyQuestion.findOne({ questionNumber });
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Fetch grouped keyword tags
    const groupedTags = await GroupedKeywordTag.findOne({ questionNumber });

    res.json({
      question,
      groupedTags: groupedTags || []  // Return empty array if not found
    });
  } catch (err) {
    console.error('Error fetching question and grouped tags:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
