const mongoose = require('mongoose');
const dotenv = require('dotenv');
const DiyQuestion = require('../models/DiyQuestion');

dotenv.config();

const questions = [
  'What best describes your employment or contractor status?',
  'What kind of commercial arrangement or business deal are you entering into?',
  "What aspect of your company's ownership, funding, or internal governance do you need to formalize?",
  'Please select all the data governance and privacy activities that are relevant to your current or planned business operations.',
  'Please identify all the following regulatory environments or data handling scenarios that are part of your current or planned business activities.',
  'Please identify which of these data sharing methods or security planning areas are currently a part of your business operations.',
  'Please identify which of these employee data and technology policies our company currently lacks or needs to urgently update.',
  'Please identify which of these advertising and marketing compliance reports we need to create or update to accurately reflect our current campaigns and data usage.',
  'Please identify all the ways our organization is currently using or developing artificial intelligence so we can assess the impact on our data protection obligations and business processes.',
  'Please identify all the following topics related to employee relations, workplace safety, and external workforce engagement that are a current priority for our business to address.'
];

async function seedDiyQuestions() {
  try {
    console.log('🌱 Seeding questions...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    await DiyQuestion.deleteMany({});
    console.log('🧹 Old questions deleted');

    const questionDocs = questions.map((question, index) => ({
      questionNumber: index + 1,
      question
    }));

    await DiyQuestion.insertMany(questionDocs);
    console.log(`✅ ${questionDocs.length} questions inserted`);
  } catch (err) {
    console.error('❌ Error seeding questions:', err);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB disconnected');
    process.exit();
  }
}

seedDiyQuestions();
