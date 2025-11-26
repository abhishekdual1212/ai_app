const mongoose = require('mongoose');
const PriceBreakdownSchema = require('./PriceBreakdown');
const ProgressSchema = require('./Progress');

const IntentQuestionSchema = new mongoose.Schema({
  questionNumber: Number,
  questionText: String,
  answer: String,
  fileUrl: String
}, { _id: false });

const IntentSchema = new mongoose.Schema({
  type: { type: String, enum: ['Search', 'Chat'] },
  intent_label: { type: String },
  questions: { type: [IntentQuestionSchema], default: [] },
  query_id: { type: String, unique: true, sparse: true },
  pricing: { type: PriceBreakdownSchema, default: () => ({}) },
  progress: {
  type: [ProgressSchema],
  default: function () {
    return [
      { label: 'Form Filled', type: 'Chat', status: false },
      { label: 'Draft Created by AI', type: 'Chat', status: false },
      { label: 'Payment Pending', type: 'Chat', status: false },
      { label: 'Draft going to lawyer', type: 'Chat', status: false },
      { label: 'Lawyer Updated the draft', type: 'Chat', status: false },
      { label: 'Lawyer approved and signed', type: 'Chat', status: false },
      { label: 'Delivered to your Dashboard', type: 'Chat', status: false }
    ];
  }
}
,
  sector: { type: String },
  service: { type: String },
  ai_generated_file_urls: [{
    url: String,
    filename: String,
    uploaded_at: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

const Intent = mongoose.models.Intent || mongoose.model('Intent', IntentSchema);

// ✅ Export both model and schema
module.exports = {
  Intent,
  IntentSchema
};
