// models/StartupAnswer.js
const mongoose = require('mongoose');

const answerItemSchema = new mongoose.Schema({
  // preserve whatever type the FE sends (1 or "1")
  id:   { type: mongoose.Schema.Types.Mixed, required: true },
  text: { type: String, required: true, trim: true },
}, { _id: false });

const startupAnswerSchema = new mongoose.Schema({
  order_id:  { type: String, required: true, unique: true, index: true }, // uuid
  userId:    { type: String, required: true, index: true },               // firebase uid
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserSession' },

  user_type: { type: String, default: 'startup', immutable: true, required: true },

  answers: {
    type: [answerItemSchema],
    default: [],
    validate: {
      validator(v) { return v.length <= 42; },
      message: 'answers cannot exceed 42 entries'
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('StartupAnswer', startupAnswerSchema);
