const xlsx = require('xlsx');
const mongoose = require('mongoose');
const { LegalCatalog } = require('../models/LegalCatalog');

const workbook = xlsx.readFile('./seed/Chat with us and search services - questions.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = xlsx.utils.sheet_to_json(sheet);
const dotenv = require('dotenv');

dotenv.config();
async function insertQuestionsIntoIntents() {
  await mongoose.connect(process.env.MONGODB_URI)

  try {
    const catalogs = await LegalCatalog.find();

    for (const row of rows) {
      let docName = row['Document Name']?.trim();
      const question1 = row['Question 1']?.trim();
      const question2 = row['Question 2']?.trim();

      if (!docName || !question1 || !question2) {
        console.warn(`⚠️ Skipping incomplete row:`, row);
        continue;
      }

      docName = docName.replace(/[–—]/g, '-');

        // Now split on first hyphen and get the part after it
        const dashIndex = docName.indexOf('-');
        if (dashIndex !== -1) {
        docName = docName.slice(dashIndex + 1).trim();
        }


      let intentFound = false;

      for (const catalog of catalogs) {
        for (const service of catalog.services) {
          for (const intent of service.intents) {
            if (intent.name.trim().toLowerCase() === docName.toLowerCase()) {
              // Push questions
              intent.questions = [
          {
            question: question1.trim(),
            type: 'Test/media',
            questionNumber: 1
          },
          {
            question: question2.trim(),
            type: 'Test/media',
            questionNumber: 2
          }
        ];

        await catalog.save();

              console.log(`✅ Questions added to intent: "${intent.name}"`);
              intentFound = true;
              break;
            }
          }
          if (intentFound) break;
        }
        if (intentFound) break;
      }

      if (!intentFound) {
        console.warn(`❌ Intent not found for: "${docName}"`);
      }
    }

    console.log('🎉 Question insertion complete.');
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error inserting questions:', err);
  }
}

insertQuestionsIntoIntents();
