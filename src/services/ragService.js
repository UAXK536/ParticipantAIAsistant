'use strict';

const { VectorStore } = require('./vectorStore');
const embeddingService = require('./embeddingService');
const llmService = require('./llmService');
const knowledgeBase = require('../data/knowledgeBase');
const config = require('../config');

const store = new VectorStore();
let _indexed = false;

/**
 * Indexes all knowledge-base documents on first use.
 * Embeddings are fetched from OpenAI and stored in the in-memory vector store.
 */
async function ensureIndexed() {
  if (_indexed) return;

  const texts = knowledgeBase.map((doc) => getSearchableText(doc));
  const embeddings = await embeddingService.embedBatch(texts);

  knowledgeBase.forEach((doc, i) => store.add(doc, embeddings[i]));
  _indexed = true;
  console.log(`[RAG] Indexed ${store.size} documents.`);
}

/**
 * Answers a participant question using the RAG pipeline:
 *   1. Embed the query.
 *   2. Retrieve top-k similar documents from the vector store.
 *   3. Pass context + question to the LLM.
 *
 * @param {string} question - Participant's question.
 * @param {Array<{role: string, content: string}>} [history=[]] - Prior conversation turns.
 * @returns {Promise<{answer: string, sources: Array<{id: string, title: string, category: string, score: number}>}>}
 */
async function ask(question, history = []) {
  const directAnswer = askDirectlyFromLocalKnowledge(question);
  if (directAnswer) return directAnswer;

  if (!config.openai.apiKey) {
    return askFromLocalKnowledge(question, 'OpenAI API key is not configured.');
  }

  try {
    await ensureIndexed();

    const queryEmbedding = await embeddingService.embed(question);
    const docs = store.search(queryEmbedding, config.rag.topK, config.rag.similarityThreshold);

    const answer = await llmService.chat(question, docs, history);

    const sources = docs.map(({ id, title, category, score }) => ({ id, title, category, score }));

    return { answer, sources };
  } catch (err) {
    if (isOpenAIAvailabilityError(err)) {
      return askFromLocalKnowledge(question, 'OpenAI is unavailable for this account right now.');
    }

    throw err;
  }
}

function askDirectlyFromLocalKnowledge(question) {
  const [doc] = searchLocalKnowledge(question, 1);
  if (!doc || !doc.answer || doc.score < 0.75) return null;

  return {
    answer: doc.answer,
    sources: [{ id: doc.id, title: doc.title, category: doc.category, score: doc.score }],
  };
}

function askFromLocalKnowledge(question, fallbackReason) {
  const docs = searchLocalKnowledge(question, config.rag.topK);
  const fallbackNote = fallbackReason
    ? `${fallbackReason} Showing a local knowledge-base answer instead.\n\n`
    : '';

  if (docs.length === 0) {
    return {
      answer: `${fallbackNote}I could not find a matching answer in the local knowledge base. Please check your OpenAI billing/API key for full AI responses, or contact support for help.`,
      sources: [],
    };
  }

  const primaryDoc = docs[0];
  if (primaryDoc.answer) {
    return {
      answer: `${fallbackNote}${primaryDoc.answer}`,
      sources: docs.map(({ id, title, category, score }) => ({ id, title, category, score })),
    };
  }

  const answer = `${fallbackNote}I found this in the local knowledge base:\n\n${primaryDoc.content}\n\nFor full AI-generated answers, check your OpenAI API key, quota, and billing setup.`;
  const sources = docs.map(({ id, title, category, score }) => ({ id, title, category, score }));

  return { answer, sources };
}

function isOpenAIAvailabilityError(err) {
  return err && [401, 403, 429].includes(err.status);
}

function searchLocalKnowledge(question, topK) {
  const queryTokens = tokenize(question);
  if (queryTokens.length === 0) return [];

  return knowledgeBase
    .map((doc) => {
      const searchableText = getSearchableText(doc);
      const docTokens = tokenize(searchableText);
      const matches = queryTokens.filter((token) => docTokens.includes(token));
      const score = matches.length / queryTokens.length;

      return { ...doc, score };
    })
    .filter((doc) => doc.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

function getSearchableText(doc) {
  return [doc.category, doc.title, doc.content, doc.answer, ...(doc.questions || [])]
    .filter(Boolean)
    .join(' ');
}

function tokenize(text) {
  const stopWords = new Set(['a', 'an', 'and', 'are', 'can', 'do', 'for', 'how', 'i', 'in', 'is', 'me', 'my', 'of', 'or', 'the', 'to', 'what', 'when', 'where']);

  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 1 && !stopWords.has(token));
}

/**
 * Resets the index (used in testing / reloading).
 */
function resetIndex() {
  store.clear();
  _indexed = false;
}

module.exports = { ask, ensureIndexed, resetIndex };
