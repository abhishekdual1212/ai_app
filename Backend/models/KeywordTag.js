const mongoose = require('mongoose');

const keywordTagSchema = new mongoose.Schema({
  questionNumber: Number,
  keywordId: String,
  tag: String
});

module.exports = mongoose.model('KeywordTag', keywordTagSchema);
  