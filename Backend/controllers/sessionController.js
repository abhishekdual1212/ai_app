const UserSession = require('../models/UserSession');
// const DiyQuestion = require('../models/DiyQuestion');
// const Outcome = require('../models/Outcome');
const User = require('../models/User')
const mongoose = require('mongoose');


// Utility for response format
const respond = (res, success, message, data = null, status = 200) => {
  return res.status(status).json({ success, message, data });
};

exports.createSession = async (req, res) => {
  try {
    const { userId } = req.body;

    // Validate userId
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      return respond(res, false, 'user_id is required and must be a non-empty string', null, 400);
    }

    // Check if user exists
    const user = await User.findOne({ firebase_uid: userId });  // ✅ correct
    if (!user) {
      return respond(res, false, 'User not found', null, 404);
    }

    // Check if a session already exists for this user
    let session = await UserSession.findOne({ userId });

    if (session) {
      return respond(res, true, 'Session already exists', session);
    }

    // Create new session
    session = await UserSession.create({
      userId: userId,
      username: user.name || ''
    });

    return respond(res, true, 'Session created successfully', session);
  } catch (err) {
    console.error('Error creating session:', err);
    return respond(res, false, 'Server error', null, 500);
  }
};











// @route   GET /api/sessions/:id
// @desc    Fetch a user session by ID
// @access  Private (or Public - adjust as needed)

exports.getSession = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if ID is provided and valid MongoDB ObjectId
    if (!id || id.length !== 24) {
      return respond(res, false, 'Invalid session ID format', null, 400);
    }

    const session = await UserSession.findById(id);

    if (!session) {
      return respond(res, false, 'Session not found', null, 404);
    }

    return respond(res, true, 'Session fetched successfully', session);
  } catch (err) {
    console.error('Error fetching session:', err.message);
    return respond(res, false, 'Internal server error', null, 500);
  }
};








exports.getOrCreateSessionByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if userId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return respond(res, false, 'Invalid userId format', null, 400);
    }

    // Look for existing session
    let session = await UserSession.findOne({ userId });

    // Create new session if not found
    if (!session) {
      session = await UserSession.create({ userId });
    }

    return respond(res, true, 'Session fetched or created successfully', session, 200);

  } catch (error) {
    console.error('Error in getOrCreateSessionByUserId:', error.message);
    return respond(res, false, 'Internal Server Error', null, 500);
  }
};







// @route   PATCH /api/sessions/:id/sector
// @desc    Update the sector field in currentIntent of a session
// @access  Private (or Public - based on your app's logic)

// const mongoose = require('mongoose');

exports.setSector = async (req, res) => {
  const { id } = req.params;
  const { sector } = req.body;

  // Validate session ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return respond(res, false, 'Invalid session ID format', null, 400);
  }

  // Validate sector value
  if (!sector || typeof sector !== 'string' || sector.trim() === '') {
    return respond(res, false, 'Sector is required and must be a non-empty string', null, 400);
  }

  try {
    const session = await UserSession.findByIdAndUpdate(
      id,
      { 'currentIntent.sector': sector },
      { new: true }
    );

    if (!session) {
      return respond(res, false, 'Session not found', null, 404);
    }

    return respond(res, true, 'Sector updated successfully', session, 200);

  } catch (err) {
    console.error('Error updating sector:', err.message);
    return respond(res, false, 'Internal server error', null, 500);
  }
};


// Set service

exports.setService = async (req, res) => {
  const { id } = req.params;
  const { service } = req.body;

  // Validate session ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return respond(res, false, 'Invalid session ID format', null, 400);
  }

  // Validate service value
  if (!service || typeof service !== 'string' || service.trim() === '') {
    return respond(res, false, 'Service is required and must be a non-empty string', null, 400);
  }

  try {
    const session = await UserSession.findByIdAndUpdate(
      id,
      { 'currentIntent.service': service },
      { new: true }
    );

    if (!session) {
      return respond(res, false, 'Session not found', null, 404);
    }

    return respond(res, true, 'Service updated successfully', session, 200);

  } catch (err) {
    console.error('Error updating service:', err.message);
    return respond(res, false, 'Internal server error', null, 500);
  }
};

// @route   PATCH /api/sessions/:id/intent-label

exports.setIntentLabel = async (req, res) => {
  const { id } = req.params;
  const { intent_label, type } = req.body;

  // Validate ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return respond(res, false, 'Invalid session ID format', null, 400);
  }

  // Validate required fields
  if (!intent_label || typeof intent_label !== 'string' || !type || typeof type !== 'string') {
    return respond(res, false, 'Both intent_label and type are required and must be strings', null, 400);
  }

  try {
    const session = await UserSession.findById(id);

    if (!session) {
      return respond(res, false, 'Session not found', null, 404);
    }

    // Update or initialize currentIntent
    session.currentIntent = {
      ...session.currentIntent,
      intent_label,
      type,
    };

    await session.save();

    return respond(res, true, 'Intent label and type updated successfully', session, 200);

  } catch (err) {
    console.error('Error updating intent_label:', err.message);
    return respond(res, false, 'Internal server error', null, 500);
  }
};








exports.getDiyOutcomeByChatId = async (req, res) => {
  const { chat_id } = req.params;

  if (!chat_id) {
    return respond(res, false, 'chat_id is required', null, 400);
  }

  try {
    const chat = await DiyChat.findOne({ chat_id });

    if (!chat) {
      return respond(res, false, 'Chat not found for the given chat_id', null, 404);
    }

    return respond(res, true, 'DIY outcomes fetched successfully', chat.selected_outcomes || [], 200);

  } catch (err) {
    console.error('Error fetching DIY outcomes:', err);
    return respond(res, false, 'Internal server error', null, 500);
  }
};









;
const Outcome = require('../models/Outcome');
const DiyChat = require('../models/DiyChat');


exports.saveDiyOutcome = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { questionNumber, selectedOptions, chat_id } = req.body;

    // ✅ Validate inputs
    if (
      typeof questionNumber !== 'number' ||
      !Array.isArray(selectedOptions) ||
      selectedOptions.length === 0
    ) {
      return respond(res, false, 'Invalid or missing parameters: questionNumber and selectedOptions are required', null, 400);
    }

    // ✅ Build outcome object
    const outcomes = await Outcome.find({
      questionNumber,
      optionId: { $in: selectedOptions },
    });

    const outcomeStrings = Array.from(
      new Set(outcomes.flatMap(o => o.outcomes))
    );

    const newOutcome = {
      questionNumber,
      questionText: '',
      answer: selectedOptions.join(', '),
      outcomes: outcomeStrings
    };

    let usedChatId = chat_id;

    // ✅ CASE 1: chat_id is provided – update existing chat
    if (chat_id) {
      const existingChat = await DiyChat.findOne({ chat_id });

      if (!existingChat) {
        return respond(res, false, 'Chat not found', null, 404);
      }

      existingChat.selected_outcomes.push(newOutcome);
      await existingChat.save();

      return respond(res, true, 'DIY outcome saved to existing chat', {
        chat_id: chat_id,
        selected_outcomes: newOutcome
      }, 200);
    }

    // ✅ CASE 2: sessionId is provided – create new chat
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return respond(res, false, 'Invalid session ID format', null, 400);
    }

    const session = await UserSession.findById(sessionId);
    if (!session) {
      return respond(res, false, 'Session not found', null, 404);
    }

    usedChatId = new mongoose.Types.ObjectId().toString();

    const newChat = new DiyChat({
      sessionId,
      chat_id: usedChatId,
      customer_name: session.username || 'User',
      created_by: session.userId,
      selected_outcomes: [newOutcome],
      generated_outcomes: []
    });

    await newChat.save();

    return respond(res, true, 'DIY outcome saved and new chat created', {
      chat_id: usedChatId,
      selected_outcomes: newOutcome
    }, 200);

  } catch (err) {
    console.error('Error saving DIY outcome:', err);
    return respond(res, false, 'Internal server error', null, 500);
  }
};











// @route   POST /api/sessions/:sessionId/intent-question
const IntentChat = require('../models/IntentChat');



exports.saveIntentQuestion = async (req, res) => {
  try {
    const { chat_id, questionNumber, questionText, answer, query_id } = req.body;
    const file = req.file;

    // Validate chat_id
    if (!chat_id || !query_id || !questionNumber || !questionText) {
      return respond(res, false, 'Missing required fields: chat_id, query_id, questionNumber, questionText are required', null, 400);
    }

    const chat = await IntentChat.findOne({ chat_id });
    if (!chat) {
      return respond(res, false, 'Chat not found', null, 404);
    }

    const intent = chat.intent;
    if (!intent || intent.query_id !== query_id) {
      return respond(res, false, 'Intent not found or query_id mismatch', null, 404);
    }

    const fileUrl = file ? `/uploads/${file.filename}` : null;
    const questionNum = parseInt(questionNumber);

    const existingQuestion = intent.questions.find(q => q.questionNumber === questionNum);
    if (existingQuestion) {
      existingQuestion.questionText = questionText;
      existingQuestion.answer = answer || null;
      existingQuestion.fileUrl = fileUrl || existingQuestion.fileUrl || null;
    } else {
      intent.questions.push({
        questionNumber: questionNum,
        questionText,
        answer: answer || null,
        fileUrl: fileUrl || null
      });
    }

    await chat.save();

    return respond(res, true, 'Intent question saved successfully', intent.questions, 200);

  } catch (err) {
    console.error('Error saving intent question:', err.message);
    return respond(res, false, 'Internal server error', null, 500);
  }
};


// @route   POST /api/sessions/:sessionId/diy-outcomes/answer
// @desc    Save or update an answer for a DIY outcome question in a session
// @access  Private (adjust as needed)

// const mongoose = require('mongoose');




exports.saveDiyOutcomeAnswer = async (req, res) => {
  try {
    const { chat_id, query_id, questionNumber, questionText, answer } = req.body;

    // ✅ Validate required fields
    if (
      !chat_id || !query_id ||
      questionNumber === undefined || questionNumber === null ||
      !questionText || typeof questionText !== 'string' ||
      !answer
    ) {
      return respond(
        res,
        false,
        'Missing required fields: chat_id, query_id, questionNumber, questionText, and answer are all required.',
        null,
        400
      );
    }

    // ✅ Find the chat
    const chat = await DiyChat.findOne({ chat_id });

    if (!chat) {
      return respond(res, false, 'Chat not found', null, 404);
    }

    // ✅ Find the outcome inside the chat
    const outcome = chat.generated_outcomes.find(o => o.query_id === query_id);
    if (!outcome) {
      return respond(res, false, 'Generated outcome not found for given query_id', null, 404);
    }

    // ✅ Add or update question inside the outcome
    const existingQuestion = outcome.questions.find(q => q.questionNumber === questionNumber);

    if (existingQuestion) {
      existingQuestion.questionText = questionText;
      existingQuestion.answer = answer;
    } else {
      outcome.questions.push({ questionNumber, questionText, answer });
    }

    await chat.save();

    return respond(res, true, 'DIY outcome answer saved successfully', outcome.questions, 200);

  } catch (err) {
    console.error('Error saving DIY outcome answer:', err.message);
    return respond(res, false, 'Internal server error', null, 500);
  }
};









exports.getDiyOutcomeByQueryId = async (req, res) => {
  const { chat_id } = req.params;
  const { query_id } = req.query;

  if (!chat_id || !query_id) {
    return res.status(400).json({
      success: false,
      message: 'chat_id and query_id are required',
    });
  }

  try {
    const chat = await DiyChat.findOne({ chat_id });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found',
      });
    }

    const outcome = chat.generated_outcomes.find(o => o.query_id === query_id);

    if (!outcome) {
      return res.status(404).json({
        success: false,
        message: 'DIY Outcome with given query_id not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'DIY Outcome retrieved successfully',
      data: outcome,
    });
  } catch (err) {
    console.error('Error fetching diyOutcome:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};




// GET all diyOutcomes for a sessionId
exports.getAllDiyOutcomes = async (req, res) => {
  const { chat_id } = req.params;
  console.log(chat_id)

  if (!chat_id) {
    return res.status(400).json({ success: false, message: 'chat_id is required' });
  }

  try {
    const chat = await DiyChat.findOne({ chat_id });

    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }
    

    return res.status(200).json({
      success: true,
      message: 'DIY Outcomes retrieved successfully',
      data: chat.generated_outcomes || []
    });
  } catch (err) {
    console.error('Error in getAllDiyOutcomes:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};










function slugify(text) {
  return text?.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
}


exports.getIntentByChatId = async (req, res) => {
  const { chat_id } = req.params;

  console.log(chat_id)

  if (!chat_id) {
    return res.status(400).json({
      success: false,
      message: 'chat_id is required',
    });
  }

  try {
    const chat = await IntentChat.findOne({ chat_id });

    if (!chat || !chat.intent) {
      return res.status(404).json({
        success: false,
        message: 'No intent found in this chat',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Intent retrieved successfully',
      data: chat.intent,
    });
  } catch (err) {
    console.error('Error fetching intent:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};






exports.storeAiFileInIntentChat = async (req, res) => {
  const { chat_id } = req.params;
  const { query_id, file_url } = req.body;

  if (!query_id || !file_url) {
    return res.status(400).json({ success: false, message: 'query_id and file_url are required' });
  }

  try {
    const chat = await IntentChat.findOne({ chat_id });
    if (!chat || !chat.intent || chat.intent.query_id !== query_id) {
      return res.status(404).json({ success: false, message: 'Intent not found in this chat' });
    }

    const label = slugify(chat.intent.intent_label || 'ai-file');
    const index = chat.intent.ai_generated_file_urls?.length || 0;
    const filename = `${label}_${index + 1}.pdf`;

    chat.intent.ai_generated_file_urls = chat.intent.ai_generated_file_urls || [];
    chat.intent.ai_generated_file_urls.push({
      url: file_url,
      filename,
      uploaded_at: new Date()
    });

    await chat.save();

    return res.status(200).json({
      success: true,
      message: 'File URL stored in IntentChat',
      filename
    });
  } catch (err) {
    console.error('IntentChat File Save Error:', err);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};








exports.storeAiFileInDiyChat = async (req, res) => {
  const { chat_id } = req.params;
  const { query_id, file_url } = req.body;


  if (!query_id || !file_url) {
    return res.status(400).json({ success: false, message: 'query_id and file_url are required' });
  }

  try {
    const chat = await DiyChat.findOne({ chat_id });

    if (!chat) {
      return res.status(404).json({ success: false, message: 'DiyChat not found' });
    }

    const outcome = chat.generated_outcomes.find(o => o.query_id === query_id);

    if (!outcome) {
      return res.status(404).json({ success: false, message: 'DIY Outcome not found in chat' });
    }

    const label = slugify(outcome.OutcomeLabel || 'ai-file');
    const index = outcome.ai_generated_file_urls?.length || 0;
    const filename = `${label}_${index + 1}.pdf`;

    outcome.ai_generated_file_urls = outcome.ai_generated_file_urls || [];
    outcome.ai_generated_file_urls.push({
      url: file_url,
      filename,
      uploaded_at: new Date()
    });

    await chat.save();

    return res.status(200).json({
      success: true,
      message: 'File URL stored in DiyChat outcome',
      filename
    });
  } catch (err) {
    console.error('DIY Chat File Save Error:', err);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

exports.getChatStatus = async (req, res) => {
  const { chat_id, type } = req.query;

  // ✅ Validate input
  if (!chat_id || !type) {
    return respond(res, false, 'chat_id and type are required', null, 400);
  }

  try {
    let chat = null;

    if (type === 'DIY') {
      chat = await DiyChat.findOne({ chat_id });
    } else if (type === 'Intent') {
      chat = await IntentChat.findOne({ chat_id });
    } else {
      return respond(res, false, 'Invalid type. Must be either "DIY" or "Intent"', null, 400);
    }

    if (!chat) {
      return respond(res, false, `Chat not found for chat_id: ${chat_id}`, null, 404);
    }

    return respond(res, true, 'Chat status fetched successfully', chat);

  } catch (err) {
    console.error('Error fetching chat status:', err);
    return respond(res, false, 'Internal server error', null, 500);
  }
};
