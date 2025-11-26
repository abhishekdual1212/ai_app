const DiyChat = require('../models/DiyChat');
const IntentChat = require('../models/IntentChat');
const respond = require('../utils/respond');
const mongoose = require('mongoose');

exports.getAllChatsBySessionId = async (req, res) => {
  const { sessionId } = req.params;

  console.log(sessionId)

  if (!mongoose.Types.ObjectId.isValid(sessionId)) {
    return respond(res, false, 'Invalid session ID format', null, 400);
  }

  try {
    const [diyChats, intentChats] = await Promise.all([
      DiyChat.find({ sessionId }).lean(),
      IntentChat.find({ sessionId }).lean()
    ]);

    const updatedChats = diyChats.map(({ generated_outcomes, ...rest }) => ({
  ...rest,
  chatType: 'DIY'
}));

    // Use the spread operator '...' to flatten the array
    const allChats = [
      ...updatedChats,
      ...intentChats.map(chat => ({ ...chat, chatType: 'Intent' }))
    ];

    allChats.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    return respond(res, true, 'All chats for session fetched successfully', allChats, 200);
  } catch (err) {
    console.error('Error fetching chats for session:', err);
    return respond(res, false, 'Internal server error', null, 500);
  }
};
