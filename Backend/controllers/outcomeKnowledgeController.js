const OutcomeKnowledge = require('../models/OutcomeKnowledge');

exports.getGroupedByKeywordNames = async (req, res) => {
  try {
    const { names } = req.query;
    if (!names) {
      return res.status(400).json({ error: 'Query param "names" is required (e.g., ?names=Employment Contracts,NDA)' });
    }

    const keywordNames = names.split(',').map(name => name.trim());
    const data = await OutcomeKnowledge.find({ keywordName: { $in: keywordNames } });

    const grouped = {};
    for (const entry of data) {
      if (!grouped[entry.keywordName]) {
        grouped[entry.keywordName] = [];
      }
      grouped[entry.keywordName].push({
        explanation: entry.explanation,
        questionNumber: entry.questionNumber,
        keywordId: entry.keywordId
      });
    }

    res.json(grouped);
  } catch (err) {
    console.error('Error fetching explanations by keywordName:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getPriceByKeywordName = async (req, res) => {
  try {
    const { keywordName } = req.query;

    if (!keywordName) {
      return res.status(400).json({ error: 'Please provide keywordName in query' });
    }

    const item = await OutcomeKnowledge.findOne(
      { keywordName: { $regex: new RegExp('^' + keywordName + '$', 'i') } },
      { price: 1 }
    );

    if (!item || !item.price) {
      return res.status(404).json({ error: 'Price not found for given keywordName' });
    }

    res.json({ price: item.price });
  } catch (err) {
    console.error('Error fetching price by keywordName:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getQuestionsByKeywordName = async (req, res) => {
  try {
    const { keywordName } = req.query;
    console.log(keywordName)

    if (!keywordName) {
      return res.status(400).json({ error: 'Please provide keywordName in query' });
    }

    const outcome = await OutcomeKnowledge.findOne({ keywordName });
    

    if (!outcome) {
      return res.status(404).json({ error: 'No outcome found with that keywordName' });
    }

    res.json({
      keywordName: outcome.keywordName,
      explanation: outcome.explanation,
      questions: outcome.questions
    });

  } catch (err) {
    console.error('Error fetching questions:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
