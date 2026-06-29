'use strict';

const { VectorStore, cosineSimilarity } = require('../src/services/vectorStore');

describe('cosineSimilarity', () => {
  test('identical vectors → 1', () => {
    const v = [1, 2, 3];
    expect(cosineSimilarity(v, v)).toBeCloseTo(1);
  });

  test('orthogonal vectors → 0', () => {
    expect(cosineSimilarity([1, 0, 0], [0, 1, 0])).toBeCloseTo(0);
  });

  test('opposite vectors → -1', () => {
    expect(cosineSimilarity([1, 0], [-1, 0])).toBeCloseTo(-1);
  });

  test('zero vector → 0', () => {
    expect(cosineSimilarity([0, 0, 0], [1, 2, 3])).toBe(0);
  });

  test('empty vectors → 0', () => {
    expect(cosineSimilarity([], [])).toBe(0);
  });

  test('different length vectors → 0', () => {
    expect(cosineSimilarity([1, 2], [1, 2, 3])).toBe(0);
  });

  test('arbitrary vectors match manual computation', () => {
    const a = [3, 4];
    const b = [4, 3];
    const expected = (3 * 4 + 4 * 3) / (5 * 5);
    expect(cosineSimilarity(a, b)).toBeCloseTo(expected);
  });
});

describe('VectorStore', () => {
  let store;

  const docA = { id: 'a', category: 'points', title: 'Points Overview', content: 'Earn points.' };
  const docB = { id: 'b', category: 'badges', title: 'Badges Overview', content: 'Earn badges.' };
  const docC = { id: 'c', category: 'cases',  title: 'Cases Overview',  content: 'Open a case.' };

  const embA = [1, 0, 0];
  const embB = [0, 1, 0];
  const embC = [0, 0, 1];

  beforeEach(() => {
    store = new VectorStore();
    store.add(docA, embA);
    store.add(docB, embB);
    store.add(docC, embC);
  });

  test('size reflects the number of added documents', () => {
    expect(store.size).toBe(3);
  });

  test('search returns the most similar document first', () => {
    const results = store.search([1, 0, 0], 3);
    expect(results[0].id).toBe('a');
    expect(results[0].score).toBeCloseTo(1);
  });

  test('search respects topK limit', () => {
    const results = store.search([1, 0, 0], 2);
    expect(results.length).toBe(2);
  });

  test('search respects similarity threshold', () => {
    // Query close to docA; docB and docC are orthogonal (score 0)
    const results = store.search([1, 0, 0], 3, 0.5);
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('a');
  });

  test('search returns id, category, title, content, score fields', () => {
    const [result] = store.search([1, 0, 0], 1);
    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('category');
    expect(result).toHaveProperty('title');
    expect(result).toHaveProperty('content');
    expect(result).toHaveProperty('score');
  });

  test('clear() empties the store', () => {
    store.clear();
    expect(store.size).toBe(0);
    expect(store.search([1, 0, 0], 3)).toEqual([]);
  });

  test('results are sorted by descending score', () => {
    const query = [0.6, 0.4, 0]; // closer to A than B
    const results = store.search(query, 3);
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
    }
  });
});
