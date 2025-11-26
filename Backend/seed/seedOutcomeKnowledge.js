const mongoose = require('mongoose');
const dotenv = require('dotenv');
const xlsx = require('xlsx');
const OutcomeKnowledge = require('../models/OutcomeKnowledge'); // ✅ Adjust path if needed

dotenv.config();

// Clean keyword name (remove trailing brackets, commas, etc.)
function cleanTag(tag) {
  return tag.trim().replace(/[\s),.]+$/, '');
}

// Extracts: (1) Employment Contracts → { keywordId: "1", tag: "Employment Contracts" }
function extractTagMap(tagBlock) {
  const lines = String(tagBlock).split('\n').filter(Boolean);
  const map = new Map();

  lines.forEach(line => {
    const match = line.match(/\(?(\d+)\)?,?\s*(.+)/);
    if (match) {
      const keywordId = match[1];
      const tag = cleanTag(match[2]);
      map.set(keywordId, tag);
    }
  });

  return map;
}

// Extracts: (1) – Explanation → { keywordId: "1", explanation: "..." }
function extractExplanationLines(explanationBlock) {
  const lines = String(explanationBlock).split('\n').filter(Boolean);
  const result = [];

  lines.forEach(line => {
    // Match (1) – Explanation or 1 – Explanation, but skip lines with commas
    const match = line.match(/^\(?(\d+)\)?\s*[,–-]\s*(.+)/);

    if (match && !line.match(/\(\d+,\d+/)) {
      const keywordId = match[1];
      const explanation = match[2].replace(/\)*$/, '').trim();
      result.push({ keywordId, explanation });
    }
  });

  return result;
}



function extractOutcomeKnowledge(filePath) {
  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

  const entries = [];
  let questionNumber = 0;

  for (const row of rows) {
    const [tagBlock, explanationBlock] = row;

    if (!tagBlock || !explanationBlock) {
      questionNumber++;
      continue;
    }

    const tagMap = extractTagMap(tagBlock);
    const explanations = extractExplanationLines(explanationBlock);

    explanations.forEach(({ keywordId, explanation }) => {
      const keywordName = tagMap.get(keywordId);
      if (keywordName) {
        entries.push({
          questionNumber,
          keywordId,
          keywordName,
          explanation
        });
      }
    });

    questionNumber++;
  }

  return entries;
}

async function seedOutcomeKnowledge() {
  const filePath = './seed/Outcome Knowledge bot for answers - last stage.xlsx';

  try {
    console.log('📥 Reading Excel...');
    const entries = extractOutcomeKnowledge(filePath);

    console.log(`🔍 Parsed ${entries.length} entries`);
    if (entries.length) console.log('🧪 Sample:', entries[0]);

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    await OutcomeKnowledge.deleteMany({});
    console.log('🧹 Cleared old OutcomeKnowledge');

    await OutcomeKnowledge.insertMany(entries);
    console.log(`🚀 Inserted ${entries.length} new OutcomeKnowledge entries`);

  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB disconnected');
    process.exit();
  }
}

seedOutcomeKnowledge();
