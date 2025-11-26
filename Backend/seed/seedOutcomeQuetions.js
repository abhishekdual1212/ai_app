// seed/seedOutcomeQuestions.js

require('dotenv').config();
const mongoose = require('mongoose');    
const xlsx = require('xlsx');
const path = require('path');
const OutcomeKnowledge = require('../models/OutcomeKnowledge'); // adjust the path as needed

// DB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ Connected to DB'))
  .catch(err => console.error('❌ DB connection error:', err));


async function assignQuestionNumbersToQuestions() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to DB');

    const records = await OutcomeKnowledge.find({});
    console.log(`📄 Total records: ${records.length}`);

    for (const doc of records) {
      if (Array.isArray(doc.questions)) {
        doc.questions = doc.questions.map((question, index) => ({
          ...question.toObject(), // convert Mongoose doc to plain object
          quetionNumber: (index % 2) + 1, // 1, 2 repeating
          answerType: question.answerType || 'string' // set default if missing

        }));

        await doc.save();
        console.log(`✔️ Updated document ID: ${doc._id}`);
      }
    }

    console.log('🎉 All documents updated successfully.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

assignQuestionNumbersToQuestions();
