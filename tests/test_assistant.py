from participant_assistant.assistant import ParticipantAssistant
from participant_assistant.config import Settings
from participant_assistant.llm.provider import EchoProvider, Message, build_provider
from participant_assistant.rag.retriever import Retriever
from participant_assistant.whistle_client import WhistleClient

from tests.helpers import FakeSession, json_response


def _assistant_with_fake_api():
    session = FakeSession()
    session.register("GET", "/api/users/42", lambda **kw: json_response({"id": 42, "name": "Amit", "points": 1500}))
    session.register("GET", "/api/users/42/badges", lambda **kw: json_response([{"name": "Top Learner"}]))
    session.register("GET", "/api/users/42/recognition", lambda **kw: json_response([{"id": "r1"}, {"id": "r2"}]))
    session.register("GET", "/api/users/42/budgets", lambda **kw: json_response([{"name": "Q3", "available": 200}]))

    settings = Settings(whistle_api_token="t", llm_provider="echo")
    client = WhistleClient(settings, session=session)
    retriever = Retriever.from_directory("data/knowledge_base")
    return ParticipantAssistant(settings, whistle_client=client, retriever=retriever, llm=EchoProvider())


def test_ask_uses_knowledge_base_sources():
    assistant = _assistant_with_fake_api()
    result = assistant.ask("How do I claim a product?")
    assert result.answer
    assert any("product_claims" in s for s in result.sources)
    assert result.used_participant_data is False


def test_ask_with_participant_loads_account_data():
    assistant = _assistant_with_fake_api()
    result = assistant.ask("How many points do I have?", participant_id="42")
    assert result.used_participant_data is True
    # Echo provider surfaces grounded context that includes the points balance.
    assert "1500" in result.answer or "points" in result.answer.lower()


def test_build_provider_unknown_raises():
    try:
        build_provider(Settings(llm_provider="bogus"))
        assert False
    except ValueError:
        pass


def test_echo_provider_handles_missing_question():
    provider = EchoProvider()
    out = provider.complete([Message(role="system", content="context")])
    assert "question" in out.lower()
