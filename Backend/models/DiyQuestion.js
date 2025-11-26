const mongoose = require('mongoose');

const diyQuestionSchema = new mongoose.Schema({
  questionNumber: Number,
  question: String
});

module.exports = mongoose.model('DiyQuestion', diyQuestionSchema);
