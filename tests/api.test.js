'use strict';

const request = require('supertest');
const app = require('../src/app');

// Mock the RAG service so tests don't call OpenAI
jest.mock('../src/services/ragService', () => ({
  ask: jest.fn().mockResolvedValue({
    answer: 'You can check your points balance on the dashboard.',
    sources: [
      { id: 'points-balance', title: 'Checking Points Balance', category: 'points', score: 0.92 },
    ],
  }),
  ensureIndexed: jest.fn().mockResolvedValue(undefined),
  resetIndex: jest.fn(),
}));

const ragService = require('../src/services/ragService');

describe('GET /api/health', () => {
  test('returns 200 with status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.timestamp).toBeDefined();
  });
});

describe('GET /api/knowledge', () => {
  test('returns knowledge base summary', async () => {
    const res = await request(app).get('/api/knowledge');
    expect(res.status).toBe(200);
    expect(res.body.totalDocuments).toBeGreaterThan(0);
    expect(Array.isArray(res.body.categories)).toBe(true);
  });

  test('includes expected categories', async () => {
    const res = await request(app).get('/api/knowledge');
    const cats = res.body.categories.map((c) => c.category);
    expect(cats).toContain('points');
    expect(cats).toContain('badges');
    expect(cats).toContain('cases');
    expect(cats).toContain('recognition');
    expect(cats).toContain('product-claims');
    expect(cats).toContain('learn-and-earn');
  });
});

describe('GET /api/rewards/points', () => {
  test('returns points documents', async () => {
    const res = await request(app).get('/api/rewards/points');
    expect(res.status).toBe(200);
    expect(res.body.category).toBe('points');
    expect(Array.isArray(res.body.documents)).toBe(true);
    expect(res.body.documents.length).toBeGreaterThan(0);
  });
});

describe('GET /api/rewards/badges', () => {
  test('returns badges documents', async () => {
    const res = await request(app).get('/api/rewards/badges');
    expect(res.status).toBe(200);
    expect(res.body.category).toBe('badges');
    expect(Array.isArray(res.body.documents)).toBe(true);
  });
});

describe('GET /api/cases', () => {
  test('returns cases documents', async () => {
    const res = await request(app).get('/api/cases');
    expect(res.status).toBe(200);
    expect(res.body.category).toBe('cases');
    expect(Array.isArray(res.body.documents)).toBe(true);
  });
});

describe('GET /api/cases/recognition', () => {
  test('returns recognition documents', async () => {
    const res = await request(app).get('/api/cases/recognition');
    expect(res.status).toBe(200);
    expect(res.body.category).toBe('recognition');
  });
});

describe('GET /api/cases/claims', () => {
  test('returns product-claims documents', async () => {
    const res = await request(app).get('/api/cases/claims');
    expect(res.status).toBe(200);
    expect(res.body.category).toBe('product-claims');
  });
});

describe('GET /api/cases/learn', () => {
  test('returns learn-and-earn documents', async () => {
    const res = await request(app).get('/api/cases/learn');
    expect(res.status).toBe(200);
    expect(res.body.category).toBe('learn-and-earn');
  });
});

describe('POST /api/chat', () => {
  test('returns 400 when question is missing', async () => {
    const res = await request(app).post('/api/chat').send({});
    expect(res.status).toBe(400);
    expect(res.body.error.message).toMatch(/question/i);
  });

  test('returns 400 when question is empty string', async () => {
    const res = await request(app).post('/api/chat').send({ question: '   ' });
    expect(res.status).toBe(400);
  });

  test('returns 400 when question is too long', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ question: 'a'.repeat(1001) });
    expect(res.status).toBe(400);
  });

  test('returns 400 when history is not an array', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ question: 'How do I check my balance?', history: 'bad' });
    expect(res.status).toBe(400);
  });

  test('returns 200 with answer and sources for valid question', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ question: 'How do I check my points balance?' });
    expect(res.status).toBe(200);
    expect(res.body.answer).toBeDefined();
    expect(res.body.sources).toBeDefined();
    expect(res.body.sessionId).toBeDefined();
    expect(res.body.timestamp).toBeDefined();
  });

  test('calls ragService.ask with trimmed question', async () => {
    await request(app)
      .post('/api/chat')
      .send({ question: '  How do I earn badges?  ' });
    expect(ragService.ask).toHaveBeenCalledWith('How do I earn badges?', []);
  });

  test('passes sessionId from request body if provided', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ question: 'What are my points?', sessionId: 'session-123' });
    expect(res.body.sessionId).toBe('session-123');
  });

  test('generates a sessionId when none is provided', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ question: 'What are my points?' });
    expect(typeof res.body.sessionId).toBe('string');
    expect(res.body.sessionId.length).toBeGreaterThan(0);
  });

  test('returns 500 when ragService.ask throws', async () => {
    ragService.ask.mockRejectedValueOnce(new Error('OpenAI error'));
    const res = await request(app)
      .post('/api/chat')
      .send({ question: 'How many points do I have?' });
    expect(res.status).toBe(500);
  });
});

describe('404 handler', () => {
  test('unknown routes return 404', async () => {
    const res = await request(app).get('/api/unknown-route-xyz');
    expect(res.status).toBe(404);
  });
});
