"""Participant AI Assistant.

A retrieval-augmented (RAG) + LLM assistant for loyalty-program participants.
It combines a participant's live data from the Whistle loyalty platform
(users, badges, recognition, budgets) with a curated knowledge base covering
program features such as Recognition, Product Claims and Learn & Earn.
"""

from .config import Settings, load_settings
from .whistle_client import WhistleClient, WhistleAPIError
from .assistant import ParticipantAssistant, AssistantAnswer

__all__ = [
    "Settings",
    "load_settings",
    "WhistleClient",
    "WhistleAPIError",
    "ParticipantAssistant",
    "AssistantAnswer",
]

__version__ = "0.1.0"
