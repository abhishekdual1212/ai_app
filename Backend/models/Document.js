const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  session_id: { type: mongoose.Schema.Types.ObjectId, ref: 'UserSession' },
  service_type: String,
  content: String,
  status: {
    type: String,
    enum: ['draft', 'pending_review'],
    default: 'draft'
  },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Document', DocumentSchema);
