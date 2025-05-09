from typing import List, Optional

from pydantic import BaseModel, ConfigDict

from core.schema import DomainUserWithRoles


def to_camel(string: str) -> str:
    parts = string.split("_")
    return parts[0] + "".join(word.capitalize() for word in parts[1:])


class Model(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        alias_generator=to_camel,
        populate_by_name=True,
    )


class LoginRequest(Model):
    username: str
    password: str


class RefreshRequest(Model):
    refresh_token: str


class RefreshTokenRequest(Model):
    """Payload for requesting a new access token."""

    refresh_token: str


class TokenResponse(Model):
    access_token: str
    refresh_token: str
    expires_at: int


class UserListResponse(Model):
    total: int
    data: Optional[List[DomainUserWithRoles]] = None
