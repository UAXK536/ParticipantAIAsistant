'use strict';

const OpenAI = require('openai');
const config = require('../config');

let _client = null;

function getClient() {
  if (!_client) {
    _client = new OpenAI({ apiKey: config.openai.apiKey });
  }
  return _client;
}

/**
 * Generates an embedding vector for the given text using OpenAI's embedding model.
 * @param {string} text
 * @returns {Promise<number[]>}
 */
async function embed(text) {
  const client = getClient();
  const response = await client.embeddings.create({
    model: config.openai.embeddingModel,
    input: text.trim(),
  });
  return response.data[0].embedding;
}

/**
 * Generates embeddings for multiple texts in a single API call.
 * @param {string[]} texts
 * @returns {Promise<number[][]>}
 */
async function embedBatch(texts) {
  if (texts.length === 0) return [];
  const client = getClient();
  const response = await client.embeddings.create({
    model: config.openai.embeddingModel,
    input: texts.map((t) => t.trim()),
  });
  return response.data.map((d) => d.embedding);
}

module.exports = { embed, embedBatch };
