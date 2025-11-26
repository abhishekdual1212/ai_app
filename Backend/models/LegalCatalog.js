// models/LegalCatalog.js
const mongoose = require('mongoose');

const PriceSchema = new mongoose.Schema({
  professional_fees: { type: Number, default: 0 },
  government_fees: { type: Number, default: 0 },
  total_amount: { type: Number, default: 0 }
}, { _id: false });

const IntentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: PriceSchema,
  questions: [{
      type: {
    type: String,
    enum: ['Test/media', 'string', 'yes or no', 'upload'], // allowed types
    default: 'Test/media'
  },

    question: {
      type: String,
      required: true
    },
    questionNumber: Number,
  }]
});

const ServiceSchema = new mongoose.Schema({
  name: { type: String },
  intents: [IntentSchema],
});

const LegalCatalogSchema = new mongoose.Schema({
  sector: { type: String },
  services: {
    type: [ServiceSchema],
    required: true,
  },
});

// Define models
const Intent = mongoose.model('Intent', IntentSchema);
const LegalCatalog = mongoose.model('LegalCatalog', LegalCatalogSchema);

// Exports
module.exports = {
  Intent,
  IntentSchema,
  LegalCatalog,
};
