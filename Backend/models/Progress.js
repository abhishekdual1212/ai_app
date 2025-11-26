const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
  label: String,
  type: String,
  status: { type: Boolean, default: false }
}, { _id: false });

module.exports = ProgressSchema;
