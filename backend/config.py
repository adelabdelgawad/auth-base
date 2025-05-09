import json
from typing import Any, List
from pydantic.fields import FieldInfo
from pydantic_settings import (
    BaseSettings,
    DotEnvSettingsSource,
    SettingsConfigDict,
    PydanticBaseSettingsSource,
)
from pydantic import Field


class CustomDotEnvSettingsSource(DotEnvSettingsSource):
    def prepare_field_value(
        self,
        field_name: str,
        field: FieldInfo,
        value: Any,
        value_is_complex: bool,
    ) -> Any:
        if field_name == "BACKEND_CORS_ORIGINS" and isinstance(value, str):
            try:
                # Try JSON array first
                result = json.loads(value)
                if isinstance(result, list):
                    return result
            except Exception:
                # Fallback: comma-separated string
                return [v.strip() for v in value.split(",") if v.strip()]
        return super().prepare_field_value(
            field_name, field, value, value_is_complex
        )


class Settings(BaseSettings):
    PROJECT_NAME: str
    API_V1_STR: str
    SESSION_SECRET: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    REFRESH_TOKEN_EXPIRE_DAYS: int
    BACKEND_CORS_ORIGINS: List[str] = Field(default_factory=list)
    LDAP_USER_ATTRIBUTES: List[str] = Field(default_factory=list)
    AD_SERVER: str
    AD_PORT: int
    AD_BIND_USERNAME: str
    AD_BIND_PASSWORD: str
    AD_BASE_DN: str
    AD_USE_TLS: bool
    OU_PARENT_BASE: str
    # Daatabase connection settings
    DB_SERVER: str
    DB_USER: str
    DB_PASSWORD: str
    DB_NAME: str
    # Logging settings
    LOG_LEVEL: str = "INFO"

    DEFAULT_ADMIN_PASSWORD: str

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=True,
    )

    @classmethod
    def settings_customise_sources(
        cls,
        settings_cls,
        init_settings,
        env_settings,
        dotenv_settings,
        file_secret_settings,
    ):
        return (
            init_settings,
            env_settings,
            CustomDotEnvSettingsSource(settings_cls),
            file_secret_settings,
        )


settings = Settings()
