'use strict';

const { Router } = require('express');
const knowledgeBase = require('../data/knowledgeBase');

const router = Router();

const CATEGORIES = ['points', 'badges'];

function docsForCategory(category) {
  return knowledgeBase
    .filter((doc) => doc.category === category)
    .map(({ id, title, content }) => ({ id, title, content }));
}

/**
 * GET /api/rewards/points
 * Returns all knowledge-base documents for the points category.
 */
router.get('/points', (req, res) => {
  res.json({ category: 'points', documents: docsForCategory('points') });
});

/**
 * GET /api/rewards/badges
 * Returns all knowledge-base documents for the badges category.
 */
router.get('/badges', (req, res) => {
  res.json({ category: 'badges', documents: docsForCategory('badges') });
});

/**
 * GET /api/rewards/categories
 * Returns the list of reward-related categories.
 */
router.get('/categories', (req, res) => {
  res.json({ categories: CATEGORIES });
});

module.exports = router;
