// routes/legalCatalogRoutes.js
const express = require('express');
const router = express.Router();
const { searchLegalCatalog, searchRouting } = require('../controllers/legalCatalogController');

// Search endpoint
router.get('/search', searchLegalCatalog);


router.get('/search-routing', searchRouting);

module.exports = router;