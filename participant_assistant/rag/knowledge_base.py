"""Knowledge-base document loading and chunking."""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List


@dataclass
class Document:
    """A retrievable chunk of knowledge."""

    id: str
    text: str
    source: str
    metadata: Dict[str, str] = field(default_factory=dict)


def chunk_text(text: str, *, max_chars: int = 800, overlap: int = 100) -> List[str]:
    """Split text into overlapping chunks on paragraph boundaries.

    Paragraphs are kept together where possible; long paragraphs are split on
    sentence boundaries so chunks stay near ``max_chars``.
    """

    if max_chars <= 0:
        raise ValueError("max_chars must be positive")
    overlap = max(0, min(overlap, max_chars - 1))

    paragraphs = [p.strip() for p in re.split(r"\n\s*\n", text) if p.strip()]
    chunks: List[str] = []
    buffer = ""

    def flush() -> None:
        nonlocal buffer
        if buffer.strip():
            chunks.append(buffer.strip())
        buffer = ""

    for paragraph in paragraphs:
        if len(paragraph) > max_chars:
            flush()
            sentences = re.split(r"(?<=[.!?])\s+", paragraph)
            piece = ""
            for sentence in sentences:
                if len(piece) + len(sentence) + 1 > max_chars and piece:
                    chunks.append(piece.strip())
                    piece = piece[-overlap:] if overlap else ""
                piece = f"{piece} {sentence}".strip()
            if piece.strip():
                chunks.append(piece.strip())
            continue

        if len(buffer) + len(paragraph) + 2 > max_chars and buffer:
            flush()
        buffer = f"{buffer}\n\n{paragraph}".strip()

    flush()
    return chunks


def load_documents(directory: str, *, max_chars: int = 800, overlap: int = 100) -> List[Document]:
    """Load and chunk every ``.md``/``.txt`` file under ``directory``."""

    base = Path(directory)
    if not base.is_dir():
        return []

    documents: List[Document] = []
    for path in sorted(base.rglob("*")):
        if path.suffix.lower() not in {".md", ".markdown", ".txt"}:
            continue
        text = path.read_text(encoding="utf-8")
        rel = path.relative_to(base).as_posix()
        for index, chunk in enumerate(chunk_text(text, max_chars=max_chars, overlap=overlap)):
            documents.append(
                Document(
                    id=f"{rel}#{index}",
                    text=chunk,
                    source=rel,
                    metadata={"title": _first_heading(text) or path.stem},
                )
            )
    return documents


def _first_heading(text: str) -> str:
    for line in text.splitlines():
        stripped = line.strip()
        if stripped.startswith("#"):
            return stripped.lstrip("#").strip()
    return ""
