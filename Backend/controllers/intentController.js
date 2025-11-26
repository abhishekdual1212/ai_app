// Get price by intent label
const {LegalCatalog} = require('../models/LegalCatalog');

exports.getPriceByIntentName = async (req, res) => {
  const { intentName } = req.params;

  try {
    const catalog = await LegalCatalog.findOne({
      'services.intents.name': intentName
    }, {
      'services.$': 1 // project only matched service
    });

    if (!catalog) {
      return res.status(404).json({ error: 'Intent not found' });
    }

    // Find the intent in nested services
    for (const service of catalog.services) {
      const foundIntent = service.intents.find(intent => intent.name === intentName);
      if (foundIntent) {
        return res.status(200).json({ price: foundIntent.price });
      }
    }

    return res.status(404).json({ error: 'Intent not found in matched services' });
  } catch (err) {
    console.error('Error fetching intent price:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};








const UserSession = require('../models/UserSession'); // Adjust path as needed



exports.generateQueryId = async (req, res) => {
  try {
    const { id } = req.params;

    const session = await UserSession.findById(id);
    if (!session) {
      return res.status(404).json({ error: 'User session not found' });
    }

    const queryId = Math.random().toString(36).substr(2, 9); // Simple unique string
    session.queryId = queryId;
    await session.save();

    res.status(200).json({ queryId });
  } catch (err) {
    console.error('Error generating query ID:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};


const { v4: uuidv4 } = require('uuid');
const IntentChat = require('../models/IntentChat');


exports.persistCurrentIntent = async (req, res) => {
  try {
    const { chat_id } = req.params;

    if (!chat_id) {
      return res.status(400).json({ error: 'chat_id is required' });
    }

    // ✅ Find the IntentChat by chat_id
    const chat = await IntentChat.findOne({ chat_id });
    if (!chat) {
      return res.status(404).json({ error: 'IntentChat not found for given chat_id' });
    }

    if (!chat.intent) {
      return res.status(400).json({ error: 'No intent to persist in this chat' });
    }

    // ✅ Generate query_id and assign
    const query_id = uuidv4();
    chat.intent.query_id = query_id;

    await chat.save();

    return res.status(200).json({
      message: 'Intent persisted successfully',
      query_id,
      chat_id,
    });
  } catch (err) {
    console.error('Error persisting intent:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};




// controllers/intentController.js
exports.saveCurrentIntent = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { intent_label, type} = req.body;


    console.log(intent_label)



    if (!intent_label || !type) {
      return res.status(400).json({ error: 'Missing required intent fields (intent_label, type)' });
    }

    const session = await UserSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'UserSession not found' });
    }

    // Save currentIntent
    session.currentIntent = {
      intent_label,
      type,
    };

    await session.save();

    res.status(200).json({
      message: 'currentIntent saved successfully',
      currentIntent: session.currentIntent,
    });
  } catch (err) {
    console.error('Error saving currentIntent:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};