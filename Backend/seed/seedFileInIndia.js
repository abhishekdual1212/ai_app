require('dotenv').config();
const mongoose = require('mongoose');
const { LegalCatalog } = require('../models/LegalCatalog');

const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error('❌ MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

const addQuestionsToIntent = async () => {
  let connection;
  try {
    // Step 1: Connect to MongoDB
    connection = await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      connectTimeoutMS: 5000
    });
    console.log('✅ MongoDB connected');

    // Step 2: Find the catalog that contains the intent
    const catalog = await LegalCatalog.findOne({
      'services.intents.name': 'Privacy policy'
    });

    if (!catalog) {
      throw new Error('Catalog or intent not found');
    }

    // Step 3: Prepare new questions
    const newQuestions = [
      {
        type: "string",
        question: "Upload your gradle file",
        questionNumber: 1
      },
      {
        type: "upload",
        question: "Upload your manifest file",
        questionNumber: 2
      },
      {
        type: "string",
        question: "Company name",
        questionNumber: 3
      },
      {
        type: "upload",
        question: "Are you automating decision making",
        questionNumber: 4
      },
      {
        type: "yes or no",
        question: "Are you sharing the data with third party",
        questionNumber: 5
      }
    ];

    // Step 4: Add questions to the intent
    let updated = false;
    for (const service of catalog.services) {
      const intent = service.intents.find(i => i.name === 'Privacy policy');
      if (intent) {
        intent.questions.push(...newQuestions);
        updated = true;
      }
    }

    if (!updated) {
      throw new Error('Intent "Privacy policy" not found in any service');
    }

    // Step 5: Save changes
    await catalog.save();
    console.log('✅ Questions added successfully');

  } catch (err) {
    console.error('❌ Error adding questions:', err.message || err);
  } finally {
    if (connection) {
      await mongoose.disconnect();
      console.log('🔌 MongoDB disconnected');
    }
  }
};

addQuestionsToIntent();