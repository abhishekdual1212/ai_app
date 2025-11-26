const mongoose = require('mongoose');

const PriceBreakdownSchema = new mongoose.Schema({
  amount: Number,
  currency: { type: String, default: 'INR' },
});

const ProgressSchema = new mongoose.Schema({
  label: String,
  type: String,
});

const DiyOutcomeSchema = new mongoose.Schema({
  Answers:[],
  OutcomeLabel: String,
  query_id: { type: String, unique: true, sparse: true },


  price: {
  
     type: PriceBreakdownSchema, default: () => ({}) 
  },

  progress: {
    type: [ProgressSchema],
    default: [
      { label: 'Form Filled', type: 'Chat' },
      { label: 'Draft Created by AI', type: 'Chat' },
      { label: 'Payment Pending', type: 'Chat' },
      { label: 'Draft going to lawyer', type: 'Chat' },
      { label: 'Lawyer Updated the draft', type: 'Chat' },
      { label: 'Lawyer approved and signed', type: 'Chat' },
      { label: 'Delivered to your Dashboard', type: 'Chat' }
    ]
  }

}, { timestamps: true });

module.exports = mongoose.models.DiyOutcome || mongoose.model('DiyOutcome', DiyOutcomeSchema);
