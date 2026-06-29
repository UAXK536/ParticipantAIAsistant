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

const SYSTEM_PROMPT = `You are a helpful AI assistant for a loyalty program called "LoyaltyRewards".
You assist participants with questions about their points, badges, cases, recognition,
product claims, and the Learn & Earn program.

Use ONLY the context provided below to answer the participant's question. If the answer
is not found in the context, say so politely and suggest they contact support.
Be concise, friendly, and accurate. Format lists with bullet points where appropriate.`;

/**
 * Generates a chat completion using the LLM, given context documents and a user question.
 * @param {string} question - The user's question.
 * @param {Array<{title: string, content: string, score: number}>} contextDocs - Retrieved context documents.
 * @param {Array<{role: string, content: string}>} [history=[]] - Prior conversation history.
 * @returns {Promise<string>} The assistant's answer.
 */
async function chat(question, contextDocs, history = []) {
  const client = getClient();

  const contextText = contextDocs.length > 0
    ? contextDocs
        .map((doc, i) => `[${i + 1}] ${doc.title}\n${doc.content}`)
        .join('\n\n---\n\n')
    : 'No relevant context found.';

  const userMessage = `Context:\n${contextText}\n\nParticipant Question: ${question}`;

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history,
    { role: 'user', content: userMessage },
  ];

  const response = await client.chat.completions.create({
    model: config.openai.chatModel,
    messages,
    temperature: 0.3,
    max_tokens: 512,
  });

  return response.choices[0].message.content;
}

module.exports = { chat };
