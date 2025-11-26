// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const documentRoutes = require('./routes/documentRoutes');
const intentRoutes = require('./routes/intentRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const userRoutes = require("./routes/user");
const knowledgeRoutes = require('./routes/knowledge');
const outcomeKnowledgeRoutes = require('./routes/outcomeKnowledge');
const diyQuestionRoutes = require('./routes/diyQuestionRoutes');
const groupedKeywordTagsRoute = require('./routes/groupedKeywordTags');
const searchRouter = require('./routes/searchRouter');
const intentChatRouter = require('./routes/intentChatRouter');
const diyChatRouter = require('./routes/diyChatRoutes');
const apiKeyMiddleware = require('./middlewares/apiKeyMiddleware');

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger/swaggerSpec');

const dashboardRoutes = require("./routes/dashboardRoutes");
const trademarkRoutes = require('./routes/trademarkRoutes');

// NEW
const startupAnswersRoutes = require('./routes/startupAnswersRoutes');
const adminRouter = require('./routes/admin.routes');

// NEW (open/public)
const profileSyncRouter = require('./routes/userProfileSync'); // POST /api/user/profile-sync
const userstartRouter = require('./routes/userstart');         // /api/userstart/*

// NEW (protected)
const directOrderRoutes = require('./routes/directOrderRoutes'); // /api/direct-orders/*

// NEW (auth routes)
const authRoutes = require('./routes/auth');

const app = express();

// CORS
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:3001';
app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true,
}));

// Parsers & static
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static('uploads'));

// Health
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

// Mongo (default DB name "abyd" if not provided)
const DEFAULT_URI = 'mongodb://127.0.0.1:27017/abyd';
const MONGO_URI = process.env.MONGODB_URI || DEFAULT_URI;

mongoose
  .connect(MONGO_URI, {
    maxPoolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  })
  .then(() => {
    console.log(`MongoDB connected (${mongoose.connection.name})`);
    if (mongoose.connection && mongoose.connection.db) {
      app.set('db', mongoose.connection.db);
    }
  })
  .catch(err => console.error('MongoDB connection error:', err));

// Raw swagger JSON
app.get('/api-docs/swagger.json', (req, res) => {
  res.json(swaggerSpec);
});

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/* ------------------------------------------------------------------------ */
/*  OPEN ROUTES (NO x-api-key) — keep these BEFORE apiKey middleware        */
/* ------------------------------------------------------------------------ */
app.use('/api/auth', authRoutes);           // url-login, consume, me, refresh, logout
app.use('/api', profileSyncRouter);         // POST /api/user/profile-sync
app.use('/api/userstart', userstartRouter); // GET/POST/PATCH /api/userstart/*

/* ------------------------------------------------------------------------ */
/*  PROTECTED ROUTES (BEHIND x-api-key) — keep existing flow intact         */
/* ------------------------------------------------------------------------ */
app.use(apiKeyMiddleware);

// Mount API routes (unchanged)
app.use('/api/documents', documentRoutes);
app.use('/api/intents', intentRoutes);
app.use('/api/intent', intentChatRouter);
app.use('/api/diy', diyChatRouter);
app.use('/api/session', sessionRoutes);
app.use('/api', searchRouter);
app.use("/user", userRoutes);
app.use('/api/diy-questions', diyQuestionRoutes);
app.use('/api/outcome-knowledge', outcomeKnowledgeRoutes);
app.use('/api/grouped-keyword-tags', groupedKeywordTagsRoute);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use("/api", trademarkRoutes);
app.use('/api/startup', startupAnswersRoutes);
app.use('/api/admin', adminRouter);

// NEW: Direct Orders endpoints (used by frontend Direct chat flow)
app.use('/api/direct-orders', directOrderRoutes);

const PORT = process.env.PORT || 3000;

// Global error handlers
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
