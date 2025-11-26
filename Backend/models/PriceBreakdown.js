const mongoose = require('mongoose');

const PriceBreakdownSchema = new mongoose.Schema({
  amount: Number,
  currency: { type: String, default: 'INR' },
}, { _id: false });

module.exports = PriceBreakdownSchema;
