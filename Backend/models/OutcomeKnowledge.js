const mongoose = require('mongoose');

const PriceSchema = new mongoose.Schema({
  professional_fees: { type: Number, default: 0 },
  government_fees: { type: Number, default: 0 },
  total_amount: { type: Number, default: 0 }
}, { _id: false });



const QuestionSchema = new mongoose.Schema({
  text: { type: String, required: true },

  answerType: {
    type: String,
    enum: ['string', 'inputField', 'yes or no', 'upload'],
    required: true
  },
  quetionNumber:{ type: String, required: true }

}, { _id: false });


const outcomeKnowledgeSchema = new mongoose.Schema({
  questionNumber: Number,
  keywordId: String,
  keywordName: String,
  explanation: String,
  questions: [QuestionSchema], // Now array of objects with input types
  price: PriceSchema
});

module.exports = mongoose.model('OutcomeKnowledge', outcomeKnowledgeSchema);
