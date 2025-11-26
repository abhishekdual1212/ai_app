const mongoose = require('mongoose');
const PriceBreakdownSchema = require('./PriceBreakdown');
const ProgressSchema = require('./Progress');
 
const DiyOutcomeSchema = new mongoose.Schema({
  questions: [
    {
      questionNumber: Number,
      questionText: String,
      answer: String
    }
  ],
  OutcomeLabel: String,
  query_id: { type: String, unique: true, sparse: true },
 
  // ✅ NEW: persist completion so /diyPayment can show “Check Status”
  isCompleted: { type: Boolean, default: false },
 
  price: { type: PriceBreakdownSchema, default: () => ({}) },
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
  ai_generated_file_urls: [{
    url: String,
    filename: String,
    uploaded_at: { type: Date, default: Date.now }
  }]
}, { timestamps: true });
 
module.exports = DiyOutcomeSchema;