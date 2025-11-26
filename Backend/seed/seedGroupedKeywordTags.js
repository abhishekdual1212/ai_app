const mongoose = require('mongoose');
const dotenv = require('dotenv');
const xlsx = require('xlsx');
const GroupedKeywordTag = require('../models/GroupedKeywordTag');

dotenv.config();

// Clean the tag line based on parentheses logic
// Clean the tag line based on parentheses and number logic
function cleanTagLine(line) {
  if (!line) return '';

  // Remove leading numbers like "(1)", "1,", "1 -"
  line = line.replace(/^\(*\d+(?:,\d+)*\)*\s*[),–-]?\s*/, '');

  // Count parentheses
  const openCount = (line.match(/\(/g) || []).length;
  const closeCount = (line.match(/\)/g) || []).length;

  // If more closing than opening, remove unmatched trailing `)` and punctuation
  if (closeCount > openCount) {
    line = line.replace(/[)\s,]+$/, ''); // Remove trailing unmatched `)` and commas
  }

  return line.trim();
}


// Parse a line into keywordId and cleaned tag
function parseTagLine(line) {
  const match = line.match(/\(*(\d+(?:,\d+)*)\)*\s*[),–-]?\s*(.+)/);
  if (match) {
    return {
      keywordId: match[1].replace(/,/g, '+'), // "1,2" → "1+2"
      tag: cleanTagLine(match[2])            // Clean the tag part only
    };
  }
  return null;
}


// Extract grouped tags from Excel
function extractGroupedTags(filePath) {
  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

  const groupedEntries = [];

  for (let i = 1; i < rows.length; i++) {
    const [tagBlock] = rows[i]; // A column
    const questionNumber = i;

    if (tagBlock) {
      const tags = [];
      const lines = String(tagBlock).split('\n').filter(Boolean);

      for (const line of lines) {
        const parsed = parseTagLine(line);
        if (parsed) {
          tags.push(parsed);
        }
      }

      if (tags.length > 0) {
        groupedEntries.push({
          questionNumber,
          tags
        });
      }
    }
  }

  return groupedEntries;
}


async function seedGroupedKeywordTags() {
  const filePath = './seed/Knowledge bot for keywords .xlsx';

  try {
    console.log('📥 Reading Excel for grouped tags...');
    const groupedEntries = extractGroupedTags(filePath);
    console.log(`🔍 Found ${groupedEntries.length} grouped entries`);
    if (groupedEntries.length > 0) console.log('🧪 Sample:', groupedEntries[0]);

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    await GroupedKeywordTag.deleteMany({});
    console.log('🗑️ Cleared GroupedKeywordTag collection');

    await GroupedKeywordTag.insertMany(groupedEntries);
    console.log('🚀 Grouped tags inserted successfully');

  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB disconnected');
    process.exit();
  }
}

seedGroupedKeywordTags();
