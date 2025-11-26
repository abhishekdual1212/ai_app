// seed/addOutcomeKnowledgeQuestions.js

require('dotenv').config();
const mongoose = require('mongoose');
const OutcomeKnowledge = require('../models/OutcomeKnowledge'); // adjust path if needed

const MONGO_URI = process.env.MONGODB_URI;

const addQuestionsToOutcomeKnowledge = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');

    // Fetch the target OutcomeKnowledge document
    const outcome = await OutcomeKnowledge.findOne({
      keywordName: 'Privacy Policy' // or any matching condition
    });

    if (!outcome) {
      console.log('❌ OutcomeKnowledge entry not found');
      return;
    }

    // Define your new questions (compatible with QuestionSchema)
    const newQuestions = [
      {
        text: "Upload your gradle file",
        answerType: "string",
        quetionNumber: "1"
      },
      {
        text: "Upload your manifest file",
        answerType: "upload",
        quetionNumber: "2"
      },
      {
        text: "Company name",
        answerType: "string",
        quetionNumber: "3"
      },
      {
        text: "Are you automating decision making",
        answerType: "upload",
        quetionNumber: "4"
      },
      {
        text: "Are you sharing the data with third party",
        answerType: "yes or no",
        quetionNumber: "5"
      }
    ];

    // Append to existing questions
    outcome.questions.push(...newQuestions);

    await outcome.save();
    console.log('✅ Questions added successfully to OutcomeKnowledge');

    await mongoose.disconnect();
    console.log('🔌 MongoDB disconnected');
  } catch (err) {
    console.error('❌ Error:', err);
    await mongoose.disconnect();
  }
};

addQuestionsToOutcomeKnowledge();
