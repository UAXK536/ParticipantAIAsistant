"""The participant assistant: orchestrates live data, RAG and the LLM."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Dict, Iterable, List, Optional

from .config import Settings, load_settings
from .llm.provider import LLMProvider, Message, build_provider
from .rag.retriever import Retriever
from .whistle_client import WhistleAPIError, WhistleClient

SYSTEM_PROMPT = (
    "You are a helpful assistant for participants of a loyalty and rewards "
    "program. You help with Recognition, Product Claims, and Learn & Earn, and "
    "with points, badges and cash rewards. Answer using ONLY the participant "
    "context and knowledge base excerpts provided. If the answer is not "
    "present, say you don't have that information and suggest where the "
    "participant can find it. Be concise, friendly and accurate."
)


@dataclass
class AssistantAnswer:
    answer: str
    sources: List[str] = field(default_factory=list)
    used_participant_data: bool = False


class ParticipantAssistant:
    """Answers participant questions grounded in their data + the knowledge base."""

    def __init__(
        self,
        settings: Optional[Settings] = None,
        *,
        whistle_client: Optional[WhistleClient] = None,
        retriever: Optional[Retriever] = None,
        llm: Optional[LLMProvider] = None,
    ) -> None:
        self.settings = settings or load_settings()
        self.whistle = whistle_client or WhistleClient(self.settings)
        self.retriever = retriever or Retriever.from_directory(
            self.settings.knowledge_base_dir
        )
        self.llm = llm or build_provider(self.settings)

    # -- public API ----------------------------------------------------------
    def ask(self, question: str, *, participant_id: Optional[str] = None) -> AssistantAnswer:
        participant_context, used_data = self._participant_context(participant_id)
        results = self.retriever.retrieve(question, top_k=self.settings.rag_top_k)

        kb_blocks = [
            f"[{r.document.metadata.get('title', r.document.source)}] {r.document.text}"
            for r in results
        ]
        sources = _unique([r.document.source for r in results])

        context_sections = []
        if participant_context:
            context_sections.append("Participant account data:\n" + participant_context)
        if kb_blocks:
            context_sections.append("Knowledge base excerpts:\n" + "\n\n".join(kb_blocks))
        context = "\n\n".join(context_sections) if context_sections else "(no context available)"

        messages = [
            Message(role="system", content=SYSTEM_PROMPT),
            Message(role="system", content="Context:\n" + context),
            Message(role="user", content=question),
        ]
        answer_text = self.llm.complete(messages)
        return AssistantAnswer(
            answer=answer_text, sources=sources, used_participant_data=used_data
        )

    # -- helpers -------------------------------------------------------------
    def _participant_context(self, participant_id: Optional[str]) -> tuple[str, bool]:
        if not participant_id:
            return "", False
        try:
            user = self.whistle.get_user(participant_id)
            badges = self.whistle.get_user_badges(participant_id)
            recognition = self.whistle.get_user_recognition(participant_id)
            budgets = self.whistle.get_user_budgets(participant_id)
        except WhistleAPIError as exc:
            return f"(Could not load live account data: {exc})", False

        return _format_participant(user, badges, recognition, budgets), True


def _format_participant(
    user: Dict[str, Any],
    badges: List[Dict[str, Any]],
    recognition: List[Dict[str, Any]],
    budgets: List[Dict[str, Any]],
) -> str:
    lines: List[str] = []
    name = user.get("name") or user.get("fullName") or user.get("firstName") or "Participant"
    lines.append(f"Name: {name}")
    for label, key in (("Points balance", "points"), ("Cash balance", "cash")):
        if key in user:
            lines.append(f"{label}: {user[key]}")
    if badges:
        names = _unique(b.get("name") or b.get("title") or str(b.get("id")) for b in badges)
        lines.append(f"Badges earned ({len(badges)}): {', '.join(names[:10])}")
    if recognition:
        lines.append(f"Recognition activity: {len(recognition)} recent item(s)")
    if budgets:
        parts = []
        for b in budgets[:5]:
            label = b.get("name") or b.get("type") or "budget"
            amount = b.get("available") or b.get("amount") or b.get("balance")
            parts.append(f"{label}: {amount}" if amount is not None else str(label))
        lines.append("Budgets: " + "; ".join(parts))
    return "\n".join(lines)


def _unique(values: Iterable[Any]) -> List[str]:
    seen = set()
    result: List[str] = []
    for value in values:
        if value and value not in seen:
            seen.add(value)
            result.append(value)
    return result
