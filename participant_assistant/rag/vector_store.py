"""A dependency-free TF-IDF vector store with cosine-similarity search.

This keeps the assistant fully runnable offline (no embedding API or heavy ML
dependencies). The :class:`TfidfVectorStore` implements a common interface
(``add`` / ``search``) so it can later be swapped for an embedding-backed store
without changing the retriever or assistant.
"""

from __future__ import annotations

import math
import re
from collections import Counter
from dataclasses import dataclass
from typing import Dict, List, Sequence

from .knowledge_base import Document

_TOKEN_RE = re.compile(r"[a-z0-9]+")


def tokenize(text: str) -> List[str]:
    return _TOKEN_RE.findall(text.lower())


@dataclass
class SearchResult:
    document: Document
    score: float


class TfidfVectorStore:
    """In-memory TF-IDF index."""

    def __init__(self) -> None:
        self._documents: List[Document] = []
        self._doc_vectors: List[Dict[str, float]] = []
        self._idf: Dict[str, float] = {}
        self._dirty = False

    def add(self, documents: Sequence[Document]) -> None:
        self._documents.extend(documents)
        self._dirty = True

    @property
    def documents(self) -> List[Document]:
        return list(self._documents)

    def _build(self) -> None:
        n = len(self._documents)
        df: Counter = Counter()
        term_freqs: List[Counter] = []
        for doc in self._documents:
            tokens = tokenize(doc.text)
            tf = Counter(tokens)
            term_freqs.append(tf)
            for term in tf:
                df[term] += 1

        self._idf = {
            term: math.log((1 + n) / (1 + count)) + 1.0 for term, count in df.items()
        }
        self._doc_vectors = [self._to_vector(tf) for tf in term_freqs]
        self._dirty = False

    def _to_vector(self, tf: Counter) -> Dict[str, float]:
        vector: Dict[str, float] = {}
        total = sum(tf.values()) or 1
        for term, count in tf.items():
            idf = self._idf.get(term)
            if idf is None:
                continue
            vector[term] = (count / total) * idf
        norm = math.sqrt(sum(value * value for value in vector.values()))
        if norm > 0:
            for term in vector:
                vector[term] /= norm
        return vector

    def search(self, query: str, top_k: int = 4) -> List[SearchResult]:
        if not self._documents:
            return []
        if self._dirty:
            self._build()

        query_vector = self._to_vector(Counter(tokenize(query)))
        if not query_vector:
            return []

        scored: List[SearchResult] = []
        for doc, vector in zip(self._documents, self._doc_vectors):
            score = _cosine(query_vector, vector)
            if score > 0:
                scored.append(SearchResult(document=doc, score=score))

        scored.sort(key=lambda result: result.score, reverse=True)
        return scored[:top_k]


def _cosine(a: Dict[str, float], b: Dict[str, float]) -> float:
    # Vectors are pre-normalised, so the dot product is the cosine similarity.
    if len(a) > len(b):
        a, b = b, a
    return sum(value * b.get(term, 0.0) for term, value in a.items())
