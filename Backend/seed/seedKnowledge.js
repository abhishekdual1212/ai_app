const mongoose = require('mongoose');
const dotenv = require('dotenv');
const xlsx = require('xlsx');
const Knowledge = require('../models/Knowledge');

dotenv.config();

// Extract keywordId like (1), (1,2), ((3,4)) → "1", "1+2", "3+4"
function extractKeywordIdFromLine(line) {
  const match = line.match(/^\(*(\d+(?:,\d+)*)\)*\s*[),–-]/);
  if (match) {
    return match[1].split(',').map(i => i.trim()).join('+');
  }
  return null;
}

// Extract raw keyword string e.g. (1) or ((1,2))
function extractKeywordRawFromLine(line) {
  const match = line.match(/^(\(*\d+(?:,\d+)*\)*)/);
  return match ? match[1] : '';
}

// Extract explanation text by removing the leading tag
function extractExplanationFromLine(line) {
  const cleaned = line.replace(/^(\(*\d+(?:,\d+)*\)*\s*[),–-]\s*)/, '').trim();
  return cleaned.replace(/\)*$/, '').trim(); // remove trailing brackets
}

// Parse the keyword names from the first row
function parseKeywordNames(rawKeywordName) {
  if (!rawKeywordName) return {};
  
  const keywordMap = {};
  const keywordEntries = String(rawKeywordName).split('\n').filter(Boolean);
  
  for (const entry of keywordEntries) {
    const match = entry.match(/\((\d+),\s*(.+?)\)/);
    if (match) {
      const id = match[1];
      const name = match[2].trim();
      keywordMap[id] = name;
    }
  }
  
  return keywordMap;
}

// Read and parse knowledge data from Excel
function extractKnowledgeFromExcel(filePath) {
  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

  const entries = [];

  for (let i = 1; i < rows.length; i++) { // start from row 2 (index 1)
    const row = rows[i];
    const [rawKeywordName, rawExplanationBlock] = row;

    if (!rawKeywordName && !rawExplanationBlock) continue;

    const questionNumber = i; // row index as questionNumber (starting from 1 for row 2)
    const keywordMap = parseKeywordNames(rawKeywordName);

    if (rawExplanationBlock) {
      const lines = String(rawExplanationBlock).split('\n').filter(Boolean);
      for (const line of lines) {
        const keywordId = extractKeywordIdFromLine(line);
        const explanation = extractExplanationFromLine(line);

        if (keywordId && explanation) {
          // Build the keyword name by joining mapped names with '+'
          const keywordName = keywordId.split('+')
            .map(id => keywordMap[id] || `Unknown Keyword (${id})`)
            .join(' + ');

          entries.push({
            questionNumber,
            keywordId,
            keyword: keywordName,
            explanation
          });
        }
      }
    }
  }

  return entries;
}

// Main function to seed the knowledge data
async function seedKnowledge() {
  const filePath = './seed/Knowledge bot for keywords .xlsx';

  try {
    console.log('📦 Reading and parsing Excel...');
    const entries = extractKnowledgeFromExcel(filePath);

    console.log(`🔍 Parsed ${entries.length} entries`);
    if (entries.length > 0) {
      console.log('🧪 Sample:', entries[0]);
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    console.log('🗑️ Clearing existing entries...');
    await Knowledge.deleteMany({});
    console.log('✅ Existing entries cleared');

    console.log('📤 Inserting new entries...');
    await Knowledge.insertMany(entries);
    console.log(`✅ Successfully inserted ${entries.length} knowledge entries`);

  } catch (err) {
    console.error('❌ Error during seeding:', err);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB disconnected');
    process.exit();
  }
}

seedKnowledge();