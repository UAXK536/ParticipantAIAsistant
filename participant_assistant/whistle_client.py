"""HTTP client for the Whistle / WeWhistle loyalty platform.

The client exposes the resource groups required by the participant assistant:

* **Users** — participant profiles, points/cash balances.
* **Badges** — badge catalogue and badges earned by a participant.
* **Recognition** — recognition activity sent/received by a participant.
* **Budgets** — reward budgets available to a participant or program.

Authentication supports either a pre-issued API token (``WHISTLE_API_TOKEN``)
or username/password login that exchanges credentials for a bearer token.

The exact request/response shapes of the live tenant should be confirmed
against the platform's API documentation; endpoint paths are centralised in
:class:`WhistleEndpoints` so they can be adjusted without touching call sites.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional
from urllib.parse import urljoin

import requests

from .config import Settings


class WhistleAPIError(RuntimeError):
    """Raised when the Whistle API returns an error or is unreachable."""

    def __init__(self, message: str, *, status_code: Optional[int] = None) -> None:
        super().__init__(message)
        self.status_code = status_code


@dataclass
class WhistleEndpoints:
    """Centralised, overridable API paths."""

    auth: str = "/api/auth/login"
    users: str = "/api/users"
    user_detail: str = "/api/users/{user_id}"
    badges: str = "/api/badges"
    user_badges: str = "/api/users/{user_id}/badges"
    recognition: str = "/api/recognition"
    user_recognition: str = "/api/users/{user_id}/recognition"
    budgets: str = "/api/budgets"
    user_budgets: str = "/api/users/{user_id}/budgets"


@dataclass
class WhistleClient:
    """Thin, typed wrapper over the Whistle REST API."""

    settings: Settings
    endpoints: WhistleEndpoints = field(default_factory=WhistleEndpoints)
    session: requests.Session = field(default_factory=requests.Session)
    _token: Optional[str] = field(default=None, init=False, repr=False)

    def __post_init__(self) -> None:
        # Allow the auth path to be overridden via settings.
        if self.settings.whistle_auth_path:
            self.endpoints.auth = self.settings.whistle_auth_path
        if self.settings.whistle_api_token:
            self._token = self.settings.whistle_api_token

    # -- low level helpers ---------------------------------------------------
    def _url(self, path: str) -> str:
        base = self.settings.whistle_base_url.rstrip("/") + "/"
        return urljoin(base, path.lstrip("/"))

    def _headers(self, *, with_auth: bool = True) -> Dict[str, str]:
        headers = {"Accept": "application/json", "Content-Type": "application/json"}
        if with_auth and self._token:
            headers["Authorization"] = "Bearer " + self._token
        return headers

    def _request(
        self,
        method: str,
        path: str,
        *,
        params: Optional[Dict[str, Any]] = None,
        json: Optional[Dict[str, Any]] = None,
        with_auth: bool = True,
    ) -> Any:
        if with_auth and not self._token:
            self.authenticate()
        try:
            response = self.session.request(
                method,
                self._url(path),
                params=params,
                json=json,
                headers=self._headers(with_auth=with_auth),
                timeout=self.settings.whistle_timeout_seconds,
            )
        except requests.RequestException as exc:  # network errors, DNS, timeouts
            raise WhistleAPIError(f"Request to {path} failed: {exc}") from exc

        if response.status_code >= 400:
            raise WhistleAPIError(
                f"{method} {path} returned {response.status_code}: {response.text[:500]}",
                status_code=response.status_code,
            )
        if not response.content:
            return None
        try:
            return response.json()
        except ValueError as exc:
            raise WhistleAPIError(f"Non-JSON response from {path}") from exc

    # -- authentication ------------------------------------------------------
    def authenticate(self) -> str:
        """Obtain and cache a bearer token.

        Uses ``WHISTLE_API_TOKEN`` if provided; otherwise exchanges
        username/password for a token.
        """

        if self._token:
            return self._token
        if not (self.settings.whistle_username and self.settings.whistle_password):
            raise WhistleAPIError(
                "No Whistle credentials configured. Set WHISTLE_API_TOKEN or "
                "WHISTLE_USERNAME/WHISTLE_PASSWORD in the environment."
            )
        payload = {
            "username": self.settings.whistle_username,
            "password": self.settings.whistle_password,
        }
        data = self._request(
            "POST", self.endpoints.auth, json=payload, with_auth=False
        )
        token = _extract_token(data)
        if not token:
            raise WhistleAPIError("Authentication succeeded but no token was returned.")
        self._token = token
        return token

    # -- users ---------------------------------------------------------------
    def get_users(self, **params: Any) -> List[Dict[str, Any]]:
        return _as_list(self._request("GET", self.endpoints.users, params=params))

    def get_user(self, user_id: str) -> Dict[str, Any]:
        path = self.endpoints.user_detail.format(user_id=user_id)
        return self._request("GET", path)

    # -- badges --------------------------------------------------------------
    def get_badges(self, **params: Any) -> List[Dict[str, Any]]:
        return _as_list(self._request("GET", self.endpoints.badges, params=params))

    def get_user_badges(self, user_id: str, **params: Any) -> List[Dict[str, Any]]:
        path = self.endpoints.user_badges.format(user_id=user_id)
        return _as_list(self._request("GET", path, params=params))

    # -- recognition ---------------------------------------------------------
    def get_recognition(self, **params: Any) -> List[Dict[str, Any]]:
        return _as_list(self._request("GET", self.endpoints.recognition, params=params))

    def get_user_recognition(self, user_id: str, **params: Any) -> List[Dict[str, Any]]:
        path = self.endpoints.user_recognition.format(user_id=user_id)
        return _as_list(self._request("GET", path, params=params))

    # -- budgets -------------------------------------------------------------
    def get_budgets(self, **params: Any) -> List[Dict[str, Any]]:
        return _as_list(self._request("GET", self.endpoints.budgets, params=params))

    def get_user_budgets(self, user_id: str, **params: Any) -> List[Dict[str, Any]]:
        path = self.endpoints.user_budgets.format(user_id=user_id)
        return _as_list(self._request("GET", path, params=params))


def _extract_token(data: Any) -> Optional[str]:
    """Pull a bearer token out of a variety of common auth response shapes."""

    if not isinstance(data, dict):
        return None
    for key in ("token", "access_token", "accessToken", "jwt", "id_token"):
        value = data.get(key)
        if isinstance(value, str) and value:
            return value
    # Nested under "data" or "result".
    for container in ("data", "result"):
        nested = data.get(container)
        if isinstance(nested, dict):
            token = _extract_token(nested)
            if token:
                return token
    return None


def _as_list(data: Any) -> List[Dict[str, Any]]:
    """Normalise list-style responses that may be wrapped in an envelope."""

    if data is None:
        return []
    if isinstance(data, list):
        return data
    if isinstance(data, dict):
        for key in ("data", "results", "items", "records"):
            value = data.get(key)
            if isinstance(value, list):
                return value
        return [data]
    return []
