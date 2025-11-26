const mongoose = require('mongoose');

const groupedKeywordTagSchema = new mongoose.Schema({
  questionNumber: Number,
  tags: [
    {
      keywordId: String,
      tag: String
    }
  ]
});

module.exports = mongoose.model('GroupedKeywordTag', groupedKeywordTagSchema);
