// controllers/legalCatalogController.js
const { LegalCatalog } = require('../models/LegalCatalog');
const UserSession = require('../models/UserSession');
const IntentChat = require('../models/IntentChat');
const { v4: uuidv4 } = require('uuid');

function slugify(str) {
  return str.toLowerCase().replace(/\s+/g, '-');
}

// 🔐 Safe slugify function to generate URL-safe slugs
function safeSlugify(text) {
  return text
    .toLowerCase()
    .replace(/–/g, '-')           // replace em dash with hyphen
    .replace(/[\/]/g, '-')        // replace slashes with hyphen
    .replace(/[^a-z0-9\- ]/g, '') // remove special characters
    .replace(/\s+/g, '-')         // replace spaces with hyphen
    .replace(/\-+/g, '-')         // collapse multiple hyphens
    .trim();
}

// 🧱 Default progress steps
const defaultProgressSteps = () => ([
  { label: 'Form Filled', type: 'Chat', status: false },
  { label: 'Draft Created by AI', type: 'Chat', status: false },
  { label: 'Payment Pending', type: 'Chat', status: false },
  { label: 'Draft going to lawyer', type: 'Chat', status: false },
  { label: 'Lawyer Updated the draft', type: 'Chat', status: false },
  { label: 'Lawyer approved and signed', type: 'Chat', status: false },
  { label: 'Delivered to your Dashboard', type: 'Chat', status: false }
]);

// 🧠 Build intent data object
const buildIntentData = (sector = '', service = '', intent_label = '') => ({
  sector,
  service,
  intent_label,
  questions: [],
  pricing: {},
  progress: defaultProgressSteps(),
  ai_generated_file_urls: []
});

// 🚀 Insert or update intent chat
const upsertOrUpdateIntentChat = async ({ session, sessionId, chatId, intentData, type = "Search" }) => {
  if (chatId) {
    const existingChat = await IntentChat.findOne({ chat_id: chatId });
    if (!existingChat) throw new Error('IntentChat not found');

    // Preserve existing type if already set
    if (existingChat.intent?.type && existingChat.intent.type.trim() !== "") {
      intentData.type = existingChat.intent.type;
    } else {
      intentData.type = type;
    }

    existingChat.intent = intentData;
    await existingChat.save();
    return existingChat;
  }

  // Always set type for new chat
  intentData.type = type;

  const newChat = new IntentChat({
    chat_id: uuidv4(),
    sessionId,
    created_by: session?.userId,
    customer_name: session?.username || 'User',
    intent: intentData
  });

  await newChat.save();
  return newChat;
};

const searchLegalCatalog = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.length < 1) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 1 character long'
      });
    }

    // 1. Regex for terms STARTING with query
    const startsWithRegex = new RegExp(`^${query}`, 'i');
    
    // 2. Special phrases that should match if they CONTAIN the query
    const specialPhrases = [
      "Annual POSH Return Filing",
      "Office Compliance Filing" // Add more as needed
    ];

    const catalogs = await LegalCatalog.find({});
    const matchedResults = new Set();

    catalogs.forEach(catalog => {
      // Check sector
      if (catalog.sector && startsWithRegex.test(catalog.sector)) {
        matchedResults.add(catalog.sector);
      }

      // Check services and intents
      catalog.services?.forEach(service => {
        // Service name match
        if (service.name && startsWithRegex.test(service.name)) {
          matchedResults.add(service.name);
        }

        // Intent name matches
        service.intents?.forEach(intent => {
          // Standard match (starts with)
          if (intent.name && startsWithRegex.test(intent.name)) {
            matchedResults.add(intent.name);
          }
          // Special phrase match (contains)
          if (specialPhrases.some(phrase => 
            phrase === intent.name && 
            intent.name.toLowerCase().includes(query.toLowerCase())
          )) {
            matchedResults.add(intent.name);
          }
        });
      });
    });

    // Convert to array and sort
    const results = Array.from(matchedResults).sort();

    if (results.length === 0) {
      return res.json({
        success: true,
        count: 0,
        message: 'No results found',
        data: []
      });
    }

    res.json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// 🔎 Main searchRouting function
const searchRouting = async (req, res) => {
  const rawQuery = req.query.query?.trim();
  const sessionId = req.query.session_id;
  const chatId = req.query.chat_id;

  if (!rawQuery || (!sessionId && !chatId)) {
    return res.status(400).json({ success: false, message: 'Either session_id or chat_id is required with query' });
  }
  const query = rawQuery;
  const q = query.toLowerCase();

  let session = null;
  if (sessionId) {
    session = await UserSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
  }

  // 💡 Explore Legal Services shortcut (now shows "Privacy" label)
  if (q === 'explore legal services') {
    const services = [
      { name: "IPR" },
      { name: "Labour law" },
      { name: "Fractional Legal Counsel" },
      { name: "General Corporate – Contracts & Drafting" },
      { name: "Privacy" }, // ✅ changed from "Privacy & Data Protection"
      { 
        name: "I’m not sure yet", 
        externalLink: "https://calendly.com/datence-tech/30min" 
      }
    ];

    const intentData = buildIntentData();
    const chat = await upsertOrUpdateIntentChat({ session, sessionId, chatId, intentData, type: "Chat" });

    return res.json({
      type: 'Chat',
      chat_id: chat.chat_id,
      services: services.map(service => ({
        name: service.name,
        slug: safeSlugify(service.name),
        ...(service.externalLink ? { externalLink: service.externalLink } : {})
      }))
    });
  }

  const catalogs = await LegalCatalog.find();

  for (const catalog of catalogs) {
    const sectorName = (catalog.sector || '').trim();
    const sectorLower = sectorName.toLowerCase();

    // 1) ✅ SECTOR (Exact) FIRST — ensures "Privacy" shows its services
    if (sectorName && sectorLower === q) {
      const intentData = buildIntentData(sectorName);
      const chat = await upsertOrUpdateIntentChat({ session, sessionId, chatId, intentData });

      return res.json({
        type: 'sector',
        value: sectorName,
        chat_id: chat.chat_id,
        redirectTo: `/sector/${safeSlugify(sectorName)}`,
        services: Array.from(new Map(
          (catalog.services || []).map(service =>
            [safeSlugify(service.name), { name: service.name, slug: safeSlugify(service.name) }]
          )
        ).values())
      });
    }

    // 2) SERVICE match (contains)
    for (const service of catalog.services || []) {
      const serviceName = service.name || '';
      if (serviceName.toLowerCase().includes(q)) {
        const hasIntents = Array.isArray(service.intents) && service.intents.length > 0;
        const intentData = buildIntentData(sectorName, serviceName);
        const chat = await upsertOrUpdateIntentChat({ session, sessionId, chatId, intentData });

        return res.json({
          type: 'service',
          value: serviceName,
          sector: sectorName,
          chat_id: chat.chat_id,
          redirectTo: hasIntents ? `/service/${safeSlugify(serviceName)}` : `/intent/empty`,
          intents: hasIntents
            ? Array.from(new Map(service.intents.map(intent =>
                [safeSlugify(intent.name), { name: intent.name, slug: safeSlugify(intent.name) }]
              )).values())
            : []
        });
      }
    }

    // 3) SECTOR (contains) — fallback if you type partial sector names
    if (sectorName && sectorLower.includes(q)) {
      const intentData = buildIntentData(sectorName);
      const chat = await upsertOrUpdateIntentChat({ session, sessionId, chatId, intentData });

      return res.json({
        type: 'sector',
        value: sectorName,
        chat_id: chat.chat_id,
        redirectTo: `/sector/${safeSlugify(sectorName)}`,
        services: Array.from(new Map(
          (catalog.services || []).map(service =>
            [safeSlugify(service.name), { name: service.name, slug: safeSlugify(service.name) }]
          )
        ).values())
      });
    }

    // 4) INTENT (contains) — LAST so it doesn’t hijack "Privacy" → "Privacy policy"
    for (const service of catalog.services || []) {
      for (const intent of service.intents || []) {
        const intentName = intent.name || '';
        if (intentName.toLowerCase().includes(q)) {
          const intentData = buildIntentData(sectorName, service.name, intentName);
          const chat = await upsertOrUpdateIntentChat({ session, sessionId, chatId, intentData });

          return res.json({
            type: 'intent',
            value: intentName,
            sector: sectorName,
            service: service.name,
            chat_id: chat.chat_id,
            redirectTo: `/intent/${safeSlugify(intentName)}`
          });
        }
      }
    }
  }

  return res.status(404).json({ success: false, message: 'No match found' });
};

module.exports = {
  searchLegalCatalog,
  searchRouting
};
