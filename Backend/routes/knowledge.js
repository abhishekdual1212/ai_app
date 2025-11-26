const express = require('express');
const router = express.Router();

const GroupedKeywordTag = require('../models/GroupedKeywordTag');
const Knowledge = require('../models/Knowledge');





router.post('/explanations', async (req, res) => {
  const { questionNumber, keywordNames } = req.body;

  if (!questionNumber || !Array.isArray(keywordNames) || keywordNames.length === 0) {
    return res.status(400).json({ message: 'Provide questionNumber and a non-empty array of keywordNames.' });
  }

  const names = keywordNames

  let targetKeywordName;
  if (names.length === 2) {
    targetKeywordName = names.join(' + '); // e.g., "Full-Time Employees + Part-Time Employees"
  } else if (names.length === 1) {
    targetKeywordName = names[0]; // e.g., "Full-Time Employees"
  } else {
    return res.status(400).json({ message: 'Only 1 or 2 keywordNames are supported.' });
  }

  try {
    const record = await Knowledge.findOne({
      questionNumber: parseInt(questionNumber),
      keyword: targetKeywordName
    });

    if (!record) {
      return res.status(404).json({ 
        message: `No explanation found for keywords: ${targetKeywordName}`,
        suggestion: 'Check if the keyword names are exactly matching the stored format (e.g., "Full-Time Employees + Part-Time Employees")'
      });
    }

    res.json({
      questionNumber,
      keyword: record.keyword,
      explanation: record.explanation
    });
  } catch (err) {
    console.error('❌ Error fetching explanation:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;