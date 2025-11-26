// controllers/diyChatController.js
const DiyChat = require('../models/DiyChat');
const respond = require('../utils/respond');

exports.getDiyChatStatus = async (req, res) => {
  const { chat_id } = req.params;

  if (!chat_id) {
    return respond(res, false, 'chat_id is required', null, 400);
  }

  try {
    const chat = await DiyChat.findOne({ chat_id });

    if (!chat) {
      return respond(res, false, 'DiyChat not found', null, 404);
    }

    return respond(res, true, 'DiyChat status fetched successfully', chat, 200);
  } catch (err) {
    console.error('Error fetching DiyChat status:', err);
    return respond(res, false, 'Internal server error', null, 500);
  }
};




exports.getAllDiyChats = async (req, res) => {
  try {
    const chats = await DiyChat.find().sort({ updatedAt: -1 }); // descending
    return respond(res, true, 'All DIY chats fetched successfully', chats, 200);
  } catch (err) {
    console.error('Error fetching DIY chats:', err);
    return respond(res, false, 'Internal server error', null, 500);
  }
};




// controllers/diyChatController.js








const UserSession = require('../models/UserSession');


exports.createDiyChat = async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'sessionId is required' });
    }

    const session = await UserSession.findById(sessionId);

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const newChat = await DiyChat.create({
      sessionId,
      customer_name: session.username,
      created_by: session.username  // Always use from session
    });

    return res.status(201).json({
      success: true,
      message: 'DiyChat created successfully',
      chat: newChat
    });
  } catch (error) {
    console.error('Error creating DiyChat:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};










// ✅ Update DiyChat status by chat_id
exports.updateDiyChatStatus = async (req, res) => {
  const { chat_id, status } = req.body;

  if (!chat_id || !['active', 'completed', 'archived'].includes(status)) {
    return respond(res, false, 'Invalid chat_id or status', null, 400);
  }

  try {
    const chat = await DiyChat.findOneAndUpdate(
      { chat_id },
      { status },
      { new: true }
    );

    if (!chat) {
      return respond(res, false, 'DiyChat not found', null, 404);
    }

    return respond(res, true, 'DiyChat status updated successfully', chat, 200);
  } catch (error) {
    console.error('Error updating DiyChat status:', error);
    return respond(res, false, 'Internal server error', null, 500);
  }
};


// ✅ Update progress status of a generated_outcome using chat_id and query_id
exports.updateDiyProgressStatus = async (req, res) => {
  const { chat_id, query_id, label, newStatus } = req.body;

  if (!chat_id || !query_id || !label || typeof newStatus !== 'boolean') {
    return respond(res, false, 'Missing or invalid parameters', null, 400);
  }

  try {
    const chat = await DiyChat.findOne({ chat_id });

    if (!chat) {
      return respond(res, false, 'DiyChat not found', null, 404);
    }

    const outcome = chat.generated_outcomes.find(o => o.query_id === query_id);

    if (!outcome) {
      return respond(res, false, 'Outcome with provided query_id not found', null, 404);
    }

    const progressItem = outcome.progress.find(p => p.label === label);
    if (!progressItem) {
      return respond(res, false, 'Progress label not found in outcome', null, 404);
    }

    progressItem.status = newStatus;
    await chat.save();

    return respond(res, true, 'Progress status updated', outcome.progress, 200);
  } catch (err) {
    console.error('Error updating progress status in outcome:', err);
    return respond(res, false, 'Internal server error', null, 500);
  }
};
