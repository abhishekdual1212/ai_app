const mongoose = require('mongoose');
const {IntentSchema} = require('./IntentSchema');

const IntentChatSchema = new mongoose.Schema({
    sessionId: {
    type: mongoose.Schema.Types.ObjectId, // ✅ Required field for linking to UserSession
    required: true,
    ref: 'UserSession'
  },

  chat_id: {
    type: String,
    default: () => new mongoose.Types.ObjectId().toString(),
    index: true
  },
  created_by: { type: String },
  customer_name: { type: String },
  status: {
    type: String,
    enum: ['pending', 'completed', 'archived',"upload"],
    default: 'pending'
  },
  intent: IntentSchema
}, { timestamps: true });

module.exports = mongoose.model('IntentChat', IntentChatSchema);
