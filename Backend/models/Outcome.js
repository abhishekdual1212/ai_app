const mongoose = require('mongoose');

const outcomeSchema = new mongoose.Schema({
  questionNumber: Number,
  optionId: Number,
  outcomes: [String]
});

module.exports = mongoose.model('Outcome', outcomeSchema);
  