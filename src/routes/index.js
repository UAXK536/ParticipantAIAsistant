'use strict';

const { Router } = require('express');
const chatRoutes = require('./chat');
const rewardsRoutes = require('./rewards');
const casesRoutes = require('./cases');

const router = Router();

router.use('/chat', chatRoutes);
router.use('/rewards', rewardsRoutes);
router.use('/cases', casesRoutes);

/**
 * GET /api/health
 * Health check endpoint.
 */
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * GET /api/knowledge
 * Returns a summary of the available knowledge-base categories.
 */
router.get('/knowledge', (req, res) => {
  const knowledgeBase = require('../data/knowledgeBase');
  const categories = [...new Set(knowledgeBase.map((d) => d.category))];
  const summary = categories.map((cat) => ({
    category: cat,
    documentCount: knowledgeBase.filter((d) => d.category === cat).length,
    titles: knowledgeBase.filter((d) => d.category === cat).map((d) => d.title),
  }));
  res.json({ totalDocuments: knowledgeBase.length, categories: summary });
});

module.exports = router;
