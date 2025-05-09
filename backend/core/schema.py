from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


def to_camel(string: str) -> str:
    parts = string.split("_")
    return parts[0] + "".join(word.capitalize() for word in parts[1:])


class CustomModel(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        alias_generator=to_camel,
        populate_by_name=True,
    )


class DomainUser(CustomModel):
    """
    DomainUser is a Pydantic model representing a user in the system.
    It includes fields for user identification and contact information.
    """

    id: int | None = None
    username: str | None = None
    fullname: str | None = None
    title: str | None = None
    email: str | None = None

    class Config:
        orm_mode = True
        validate_by_name = True


class DomainUserWithRoles(DomainUser):
    roles: list[int] | None = None


# In core/schema.py


class PageBase(CustomModel):
    path: str
    en_title: str
    ar_title: str
    en_description: Optional[str] = None
    ar_description: Optional[str] = None
    icon: Optional[str] = None


class PageCreate(PageBase):
    pass


class PageUpdate(CustomModel):
    path: Optional[str] = None
    en_title: Optional[str] = None
    ar_title: Optional[str] = None
    en_description: Optional[str] = None
    ar_description: Optional[str] = None
    icon: Optional[str] = None


class PageRead(PageBase):
    id: int
    created_at: datetime
    updated_at: datetime
    updated_by: Optional[int] = None


class RolePagePermissionBase(CustomModel):
    role_id: int
    page_id: int
    can_view: bool = True
    can_create: bool = False
    can_edit: bool = False
    can_delete: bool = False


class RolePagePermissionCreate(RolePagePermissionBase):
    pass


class RolePagePermissionUpdate(CustomModel):
    can_view: Optional[bool] = None
    can_create: Optional[bool] = None
    can_edit: Optional[bool] = None
    can_delete: Optional[bool] = None


class RolePagePermissionRead(RolePagePermissionBase):
    id: int
    created_at: datetime
    updated_at: datetime
    updated_by: Optional[int] = None
