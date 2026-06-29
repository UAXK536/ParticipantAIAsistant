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

  const texts = knowledgeBase.map((doc) => `${doc.title}\n${doc.content}`);
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
  await ensureIndexed();

  const queryEmbedding = await embeddingService.embed(question);
  const docs = store.search(queryEmbedding, config.rag.topK, config.rag.similarityThreshold);

  const answer = await llmService.chat(question, docs, history);

  const sources = docs.map(({ id, title, category, score }) => ({ id, title, category, score }));

  return { answer, sources };
}

/**
 * Resets the index (used in testing / reloading).
 */
function resetIndex() {
  store.clear();
  _indexed = false;
}

module.exports = { ask, ensureIndexed, resetIndex };
