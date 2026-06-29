from participant_assistant.config import Settings
from participant_assistant.whistle_client import WhistleClient, WhistleAPIError, _as_list, _extract_token

from tests.helpers import FakeSession, json_response


def _settings(**kwargs):
    base = dict(
        whistle_base_url="https://test.example.com",
        whistle_username="user",
        whistle_password="pwd",
    )
    base.update(kwargs)
    return Settings(**base)


def test_authenticate_exchanges_credentials_for_token():
    session = FakeSession()
    session.register("POST", "/api/auth/login", lambda **kw: json_response({"token": "abc123"}))
    client = WhistleClient(_settings(), session=session)

    token = client.authenticate()

    assert token == "abc123"
    # Auth call should not carry an Authorization header.
    method, path, kwargs = session.calls[0]
    assert (method, path) == ("POST", "/api/auth/login")
    assert "Authorization" not in kwargs["headers"]


def test_token_from_settings_skips_login():
    session = FakeSession()
    session.register("GET", "/api/users", lambda **kw: json_response([{"id": 1}]))
    client = WhistleClient(_settings(whistle_api_token="preset"), session=session)

    users = client.get_users()

    assert users == [{"id": 1}]
    # Authorization header should use the preset token.
    _, _, kwargs = session.calls[-1]
    expected = "Bearer " + "preset"
    assert kwargs["headers"]["Authorization"] == expected


def test_get_user_badges_recognition_budgets_paths():
    session = FakeSession()
    session.register("GET", "/api/users/42", lambda **kw: json_response({"id": 42, "points": 100}))
    session.register("GET", "/api/users/42/badges", lambda **kw: json_response({"data": [{"name": "Star"}]}))
    session.register("GET", "/api/users/42/recognition", lambda **kw: json_response([{"id": "r1"}]))
    session.register("GET", "/api/users/42/budgets", lambda **kw: json_response([{"name": "Q3", "available": 50}]))
    client = WhistleClient(_settings(whistle_api_token="t"), session=session)

    assert client.get_user("42")["points"] == 100
    assert client.get_user_badges("42") == [{"name": "Star"}]
    assert client.get_user_recognition("42") == [{"id": "r1"}]
    assert client.get_user_budgets("42")[0]["available"] == 50


def test_error_status_raises():
    session = FakeSession()
    session.register("GET", "/api/users", lambda **kw: json_response({"error": "nope"}, status_code=500))
    client = WhistleClient(_settings(whistle_api_token="t"), session=session)

    try:
        client.get_users()
        assert False, "expected error"
    except WhistleAPIError as exc:
        assert exc.status_code == 500


def test_missing_credentials_raises():
    client = WhistleClient(Settings(whistle_base_url="https://x"), session=FakeSession())
    try:
        client.authenticate()
        assert False
    except WhistleAPIError:
        pass


def test_as_list_envelopes():
    assert _as_list(None) == []
    assert _as_list([1, 2]) == [1, 2]
    assert _as_list({"results": [{"a": 1}]}) == [{"a": 1}]
    assert _as_list({"a": 1}) == [{"a": 1}]


def test_extract_token_shapes():
    assert _extract_token({"access_token": "x"}) == "x"
    assert _extract_token({"data": {"jwt": "y"}}) == "y"
    assert _extract_token({"nope": 1}) is None
