const express = require('express');
const router = express.Router();
const outcomeKnowledgeController = require('../controllers/outcomeKnowledgeController');


router.get('/by-keywordName', outcomeKnowledgeController.getGroupedByKeywordNames);


router.get('/price', outcomeKnowledgeController.getPriceByKeywordName);


router.get('/questions', outcomeKnowledgeController.getQuestionsByKeywordName);

module.exports = router;
