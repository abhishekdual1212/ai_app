const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  userId: String,
  answers: [
    {
      questionNumber: Number,
      selectedOptions: [Number]
    }
  ],
  outcomes: [String]
}, { timestamps: true });

module.exports = mongoose.model('Answer', answerSchema);
