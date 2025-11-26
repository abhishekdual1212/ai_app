const mongoose = require('mongoose');
const DiyOutcomeSchema = require('./DiyOutcome');


const SelectedOutcomeSchema = new mongoose.Schema({
  questionNumber: Number,
  questionText: String,
  answer: String,
  outcomes: [String]
}, { _id: false });

const DiyChatSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserSession',
    required: true,
    index: true
  },
  chat_id: {
    type: String,
    default: () => new mongoose.Types.ObjectId().toString(),
    index: true
  },
  customer_name: { type: String },
  created_by: { type: String },
  status: {
    type: String,
     enum: ['pending', 'completed', 'archived',"upload"],
    default: 'pending'
  },
  selected_outcomes: [SelectedOutcomeSchema],
  generated_outcomes: [DiyOutcomeSchema]
}, { timestamps: true });

module.exports = mongoose.model('DiyChat', DiyChatSchema);
