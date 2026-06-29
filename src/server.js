'use strict';

const app = require('./app');
const config = require('./config');

const server = app.listen(config.port, () => {
  console.log(`[Server] Participant AI Assistant running on http://localhost:${config.port}`);
  console.log(`[Server] Environment: ${config.nodeEnv}`);
  console.log(`[Server] Chat model: ${config.openai.chatModel}`);
  console.log(`[Server] Embedding model: ${config.openai.embeddingModel}`);
});

server.on('error', (err) => {
  console.error('[Server] Fatal error:', err.message);
  process.exit(1);
});

module.exports = server;
