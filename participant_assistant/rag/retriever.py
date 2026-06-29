"""High-level retriever that wires the knowledge base into a vector store."""

from __future__ import annotations

from typing import List, Optional

from .knowledge_base import Document, load_documents
from .vector_store import SearchResult, TfidfVectorStore


class Retriever:
    """Loads documents and answers similarity queries."""

    def __init__(self, store: Optional[TfidfVectorStore] = None) -> None:
        self.store = store or TfidfVectorStore()

    @classmethod
    def from_directory(cls, directory: str) -> "Retriever":
        retriever = cls()
        retriever.add_documents(load_documents(directory))
        return retriever

    def add_documents(self, documents: List[Document]) -> None:
        self.store.add(documents)

    def retrieve(self, query: str, top_k: int = 4) -> List[SearchResult]:
        return self.store.search(query, top_k=top_k)

    @property
    def is_empty(self) -> bool:
        return not self.store.documents
