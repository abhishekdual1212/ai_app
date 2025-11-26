
const UserSession = require('../models/UserSession');



// ➤ 3. Get all outcomes for a given sessionId
exports.getDiyOutcomesBySessionId = async (req, res) => {
  const { sessionId } = req.params;

  if (!sessionId) {
    return res.status(400).json({ success: false, message: 'Missing sessionId.' });
  }

  try {
    const session = await UserSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    res.json({ success: true, data: session.currentDiyOutcome });
  } catch (err) {
    console.error('Error fetching outcomes:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};




const OutcomeKnowledge = require('../models/OutcomeKnowledge'); // fix model name

const { v4: uuidv4 } = require('uuid');


const respond = (res, success, message, data = null, status = 200) => {
  return res.status(status).json({ success, message, data });
};

const DiyChat = require('../models/DiyChat');


exports.saveDiyOutcomeToSession = async (req, res) => {
  try {
    const { outcomeLabel, chat_id } = req.body;

    if (!outcomeLabel || !chat_id) {
      return respond(res, false, 'chat_id and outcomeLabel are required', null, 400);
    }

    const outcomeData = await OutcomeKnowledge.findOne({ keywordName: outcomeLabel });
    if (!outcomeData) {
      return respond(res, false, 'OutcomeKnowledge not found for the given label', null, 404);
    }

    const targetChat = await DiyChat.findOne({ chat_id });
    if (!targetChat) {
      return respond(res, false, 'Chat not found', null, 404);
    }

    // Find an existing outcome with the same label.
    const existingOutcome = targetChat.generated_outcomes.find(
      (outcome) => outcome.OutcomeLabel === outcomeLabel
    );

    if (existingOutcome) {
      // If it's already submitted, prevent adding another.
      if (existingOutcome.isCompleted) {
        return respond(res, false, 'This draft has already been submitted for this order. You cannot add it again.', null, 409);
      }
      // If it exists but is not completed, just return it to handle refreshes without creating duplicates.
      return respond(res, true, 'Existing incomplete outcome found.', {
        chat_id,
        generated_outcome: existingOutcome
      }, 200);
    }

    const newOutcome = {
      OutcomeLabel: outcomeLabel,
      query_id: uuidv4(),
      price: outcomeData.price || {},
      isCompleted: false, // Outcome is not completed until submitted
      progress: [
        { label: 'Form Filled', type: 'Chat', status: false },
        { label: 'Draft Created by AI', type: 'Chat', status: false },
        { label: 'Payment Pending', type: 'Chat', status: false },
        { label: 'Draft going to lawyer', type: 'Chat', status: false },
        { label: 'Lawyer Updated the draft', type: 'Chat', status: false },
        { label: 'Lawyer approved and signed', type: 'Chat', status: false },
        { label: 'Delivered to your Dashboard', type: 'Chat', status: false }
      ],
      questions: [],
      ai_generated_file_urls: []
    };

    targetChat.generated_outcomes.push(newOutcome);
    await targetChat.save();

    return respond(res, true, 'Generated outcome saved successfully', {
      chat_id,
      generated_outcome: newOutcome
    }, 201);

  } catch (err) {
    console.error('Error saving generated DiyOutcome:', err);
    return respond(res, false, 'Internal server error', null, 500);
  }
};

exports.submitDiyOutcome = async (req, res) => {
  try {
    const { chat_id, query_id } = req.body;

    if (!chat_id || !query_id) {
      return respond(res, false, 'chat_id and query_id are required', null, 400);
    }

    const chat = await DiyChat.findOne({ chat_id });
    if (!chat) {
      return respond(res, false, 'Chat not found', null, 404);
    }

    const outcome = chat.generated_outcomes.find(o => o.query_id === query_id);
    if (!outcome) {
      return respond(res, false, 'Generated outcome not found for given query_id', null, 404);
    }

    // Mark the outcome as completed/submitted
    outcome.isCompleted = true;

    // Also update the 'Form Filled' progress step
    const formFilledStep = outcome.progress.find(p => p.label === 'Form Filled');
    if (formFilledStep) {
      formFilledStep.status = true;
    }

    await chat.save();

    return respond(res, true, 'DIY outcome submitted successfully', {
      chat_id,
      query_id,
      isCompleted: outcome.isCompleted,
      progress: outcome.progress
    }, 200);

  } catch (err) {
    console.error('Error submitting DIY outcome:', err.message);
    return respond(res, false, 'Internal server error', null, 500);
  }
};
