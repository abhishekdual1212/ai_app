// controllers/intentChatController.js
const IntentChat = require('../models/IntentChat');
const respond = require('../utils/respond');

exports.getIntentChatStatus = async (req, res) => {
  const { chat_id } = req.params;

  if (!chat_id) {
    return respond(res, false, 'chat_id is required', null, 400);
  }

  try {
    const chat = await IntentChat.findOne({ chat_id });

    if (!chat) {
      return respond(res, false, 'IntentChat not found', null, 404);
    }

    console.log(chat)

    return respond(res, true, 'IntentChat status fetched successfully', chat, 200);
  } catch (err) {
    console.error('Error fetching IntentChat status:', err);
    return respond(res, false, 'Internal server error', null, 500);
  }
};




exports.getAllIntentChats = async (req, res) => {
  try {
    const chats = await IntentChat.find().sort({ updatedAt: -1 }); // descending
    return respond(res, true, 'All Intent chats fetched successfully', chats, 200);
  } catch (err) {
    console.error('Error fetching Intent chats:', err);
    return respond(res, false, 'Internal server error', null, 500);
  }
};





// ✅ Get chat status by chat_id
exports.getIntentChatStatus = async (req, res) => {
  const { chat_id } = req.params;

  if (!chat_id) {
    return respond(res, false, 'chat_id is required', null, 400);
  }

  try {
    const chat = await IntentChat.findOne({ chat_id });

    if (!chat) {
      return respond(res, false, 'IntentChat not found', null, 404);
    }

    return respond(res, true, 'IntentChat status fetched successfully', chat, 200);
  } catch (err) {
    console.error('Error fetching IntentChat status:', err);
    return respond(res, false, 'Internal server error', null, 500);
  }
};

// ✅ Get all intent chats
exports.getAllIntentChats = async (req, res) => {
  try {
    const chats = await IntentChat.find().sort({ updatedAt: -1 }); // descending
    return respond(res, true, 'All Intent chats fetched successfully', chats, 200);
  } catch (err) {
    console.error('Error fetching Intent chats:', err);
    return respond(res, false, 'Internal server error', null, 500);
  }
};

// ✅ Update chat status by chat_id
exports.updateChatStatus = async (req, res) => {
  const { chat_id, status } = req.body;

  if (!chat_id || !['pending', 'completed', 'archived'].includes(status)) {
    return respond(res, false, 'Invalid chat_id or status', null, 400);
  }

  try {
    const chat = await IntentChat.findOneAndUpdate(
      { chat_id },
      { status },
      { new: true }
    );

    if (!chat) {
      return respond(res, false, 'IntentChat not found', null, 404);
    }

    return respond(res, true, 'Chat status updated successfully', chat, 200);
  } catch (err) {
    console.error('Error updating chat status:', err);
    return respond(res, false, 'Internal server error', null, 500);
  }
};

// ✅ Update progress status using chat_id and query_id
exports.updateProgressStatus = async (req, res) => {
  const { chat_id, query_id, label, newStatus } = req.body;

  if (!chat_id || !query_id || !label || typeof newStatus !== 'boolean') {
    return respond(res, false, 'Missing or invalid parameters', null, 400);
  }

  try {
    const chat = await IntentChat.findOne({ chat_id, 'intent.query_id': query_id });

    if (!chat) {
      return respond(res, false, 'IntentChat not found', null, 404);
    }

    const progressItem = chat.intent.progress.find(p => p.label === label);

    if (!progressItem) {
      return respond(res, false, 'Progress label not found', null, 404);
    }

    progressItem.status = newStatus;
    await chat.save();

    return respond(res, true, 'Progress status updated', chat.intent.progress, 200);
  } catch (err) {
    console.error('Error updating progress status:', err);
    return respond(res, false, 'Internal server error', null, 500);
  }
};

