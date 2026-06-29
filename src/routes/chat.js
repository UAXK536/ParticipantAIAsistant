'use strict';

const { Router } = require('express');
const { v4: uuidv4 } = require('uuid');
const ragService = require('../services/ragService');

const router = Router();

/**
 * POST /api/chat
 * Body: { question: string, sessionId?: string, history?: [{role, content}] }
 *
 * Sends a question through the RAG pipeline and returns an AI-generated answer
 * with source documents.
 */
router.post('/', async (req, res, next) => {
  try {
    const { question, history = [] } = req.body;

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return res.status(400).json({ error: { message: 'question is required and must be a non-empty string.' } });
    }

    if (question.trim().length > 1000) {
      return res.status(400).json({ error: { message: 'question must be 1000 characters or fewer.' } });
    }

    if (!Array.isArray(history)) {
      return res.status(400).json({ error: { message: 'history must be an array.' } });
    }

    const sessionId = req.body.sessionId || uuidv4();
    const { answer, sources } = await ragService.ask(question.trim(), history);

    res.json({
      sessionId,
      question: question.trim(),
      answer,
      sources,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
