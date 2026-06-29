'use strict';

const { Router } = require('express');
const knowledgeBase = require('../data/knowledgeBase');

const router = Router();

function docsForCategory(category) {
  return knowledgeBase
    .filter((doc) => doc.category === category)
    .map(({ id, title, content }) => ({ id, title, content }));
}

/**
 * GET /api/cases
 * Returns knowledge-base documents for the cases category.
 */
router.get('/', (req, res) => {
  res.json({ category: 'cases', documents: docsForCategory('cases') });
});

/**
 * GET /api/cases/recognition
 * Returns knowledge-base documents for peer recognition.
 */
router.get('/recognition', (req, res) => {
  res.json({ category: 'recognition', documents: docsForCategory('recognition') });
});

/**
 * GET /api/cases/claims
 * Returns knowledge-base documents for product claims.
 */
router.get('/claims', (req, res) => {
  res.json({ category: 'product-claims', documents: docsForCategory('product-claims') });
});

/**
 * GET /api/cases/learn
 * Returns knowledge-base documents for the Learn & Earn program.
 */
router.get('/learn', (req, res) => {
  res.json({ category: 'learn-and-earn', documents: docsForCategory('learn-and-earn') });
});

module.exports = router;
