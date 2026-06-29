from participant_assistant.rag.knowledge_base import Document, chunk_text, load_documents
from participant_assistant.rag.retriever import Retriever
from participant_assistant.rag.vector_store import TfidfVectorStore, tokenize


def test_chunk_text_splits_long_paragraphs():
    text = "para one. " * 200  # one very long paragraph
    chunks = chunk_text(text, max_chars=200, overlap=20)
    assert len(chunks) > 1
    assert all(len(c) <= 260 for c in chunks)


def test_load_documents_reads_knowledge_base():
    docs = load_documents("data/knowledge_base")
    assert docs, "expected knowledge base documents to load"
    sources = {d.source for d in docs}
    assert "recognition.md" in sources
    assert "product_claims.md" in sources


def test_vector_store_search_ranks_relevant_doc_first():
    store = TfidfVectorStore()
    store.add([
        Document(id="1", text="How to claim a product from the rewards catalogue using points.", source="claims"),
        Document(id="2", text="Recognition lets you send badges and cash to colleagues.", source="recognition"),
        Document(id="3", text="Learn and earn rewards completing training courses.", source="learn"),
    ])
    results = store.search("claim a product with my points", top_k=2)
    assert results
    assert results[0].document.source == "claims"


def test_retriever_from_directory_returns_sources():
    retriever = Retriever.from_directory("data/knowledge_base")
    assert not retriever.is_empty
    results = retriever.retrieve("how do I claim a product", top_k=3)
    assert results
    assert any("product_claims" in r.document.source for r in results)


def test_tokenize_basic():
    assert tokenize("Hello, World! 123") == ["hello", "world", "123"]
