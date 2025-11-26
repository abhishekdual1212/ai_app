const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    unique: true // ensures one service per type
  },
  category: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  base_price: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  intents: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Intent'
}]

}, {
  timestamps: true // adds createdAt and updatedAt
});

module.exports = mongoose.model('Service', ServiceSchema);
