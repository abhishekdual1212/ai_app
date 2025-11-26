const mongoose = require('mongoose');

const knowledgeSchema = new mongoose.Schema({
  questionNumber: Number,
  keywordId: String, // "1", "1.2", etc.
  keyword: String,   // "(1)", "((1,2))", etc.
  explanation: String
});

module.exports = mongoose.model('Knowledge', knowledgeSchema);
