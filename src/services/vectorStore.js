'use strict';

/**
 * In-memory vector store for RAG.
 * Stores document embeddings and performs cosine-similarity search.
 */
class VectorStore {
  constructor() {
    /** @type {Array<{id: string, category: string, title: string, content: string, embedding: number[]}>} */
    this._entries = [];
  }

  /**
   * Adds a document with its embedding to the store.
   * @param {{id: string, category: string, title: string, content: string}} doc
   * @param {number[]} embedding
   */
  add(doc, embedding) {
    this._entries.push({ ...doc, embedding });
  }

  /**
   * Searches for the top-k most similar documents to the query embedding.
   * @param {number[]} queryEmbedding
   * @param {number} topK
   * @param {number} [threshold=0]
   * @returns {Array<{id: string, category: string, title: string, content: string, score: number}>}
   */
  search(queryEmbedding, topK = 3, threshold = 0) {
    const results = this._entries
      .map((entry) => ({
        id: entry.id,
        category: entry.category,
        title: entry.title,
        content: entry.content,
        score: cosineSimilarity(queryEmbedding, entry.embedding),
      }))
      .filter((r) => r.score >= threshold)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    return results;
  }

  /** Returns the number of indexed documents. */
  get size() {
    return this._entries.length;
  }

  /** Clears all stored entries (useful for testing). */
  clear() {
    this._entries = [];
  }
}

/**
 * Computes cosine similarity between two equal-length numeric vectors.
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number} value between -1 and 1
 */
function cosineSimilarity(a, b) {
  if (a.length !== b.length || a.length === 0) return 0;

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;

  return dot / denominator;
}

module.exports = { VectorStore, cosineSimilarity };
