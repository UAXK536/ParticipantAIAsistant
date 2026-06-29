# Participant AI Assistant

AI-powered assistant for loyalty program participants, built with **Node.js**, **RAG** (Retrieval-Augmented Generation), and **OpenAI LLMs**.

## Overview

This POC demonstrates how AI can help loyalty program participants instantly answer questions about their rewards, reducing support load and improving engagement. It covers all key loyalty features:

| Feature | Description |
|---|---|
| **Points** | Earn, redeem, check balance, expiry rules |
| **Badges** | Bronze → Platinum tiers, special achievement badges |
| **Cases** | Create, track, and escalate support cases |
| **Recognition** | Peer-to-peer recognition with points rewards |
| **Product Claims** | Submit and track product purchase claims |
| **Learn & Earn** | Complete courses and earn points + certifications |

## Architecture

```
Participant Question
        │
        ▼
  Embedding Service  ──► OpenAI text-embedding-3-small
        │
        ▼
  Vector Store        ──► Cosine-similarity search over knowledge base
        │
        ▼
  LLM Service         ──► OpenAI gpt-4o-mini (context-grounded response)
        │
        ▼
  REST API (Express)  ──► POST /api/chat
```

The RAG pipeline:
1. Embeds the participant's question using OpenAI embeddings.
2. Retrieves the top-k most similar knowledge-base documents (cosine similarity).
3. Sends the retrieved context + question to the LLM for a grounded, accurate answer.
4. Returns the answer alongside the source documents used.

## Project Structure

```
src/
├── config/          # App configuration (env vars)
├── data/
│   └── knowledgeBase.js   # Loyalty domain documents (26 docs, 6 categories)
├── services/
│   ├── vectorStore.js     # In-memory vector store with cosine similarity
│   ├── embeddingService.js # OpenAI embeddings (batch support)
│   ├── llmService.js      # OpenAI chat completions
│   └── ragService.js      # RAG pipeline orchestration
├── routes/
│   ├── chat.js      # POST /api/chat
│   ├── rewards.js   # GET /api/rewards/points|badges
│   └── cases.js     # GET /api/cases, /recognition, /claims, /learn
├── middleware/
│   └── errorHandler.js
├── app.js           # Express app
└── server.js        # Entry point
public/
└── index.html       # Browser-based chat UI
tests/
├── vectorStore.test.js
└── api.test.js
```

## Getting Started

### Prerequisites
- Node.js 18+
- An [OpenAI API key](https://platform.openai.com/api-keys)

### Installation

```bash
npm install
```

### Configuration

Copy `.env.example` to `.env` and fill in your OpenAI API key:

```bash
cp .env.example .env
```

```env
OPENAI_API_KEY=sk-your-key-here
PORT=3000
EMBEDDING_MODEL=text-embedding-3-small
CHAT_MODEL=gpt-4o-mini
RAG_TOP_K=3
RAG_SIMILARITY_THRESHOLD=0.7
```

### Running

```bash
# Production
npm start

# Development (auto-reload)
npm run dev
```

Open **http://localhost:3000** in your browser to use the chat UI.

## API Reference

### `POST /api/chat`
Ask any question about the loyalty program.

**Request body:**
```json
{
  "question": "How do I redeem my points?",
  "sessionId": "optional-session-id",
  "history": []
}
```

**Response:**
```json
{
  "sessionId": "uuid",
  "question": "How do I redeem my points?",
  "answer": "You can redeem points for gift cards (500 points = $5)...",
  "sources": [
    { "id": "points-redemption", "title": "How to Redeem Points", "category": "points", "score": 0.91 }
  ],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### `GET /api/health` — health check
### `GET /api/knowledge` — knowledge base summary
### `GET /api/rewards/points` — points documentation
### `GET /api/rewards/badges` — badges documentation
### `GET /api/cases` — support cases documentation
### `GET /api/cases/recognition` — recognition documentation
### `GET /api/cases/claims` — product claims documentation
### `GET /api/cases/learn` — learn & earn documentation

## Running Tests

```bash
npm test
npm run test:coverage
```

