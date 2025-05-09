from datetime import datetime
from typing import List, Optional

import pytz
from sqlmodel import Field, Relationship, SQLModel

cairo_tz = pytz.timezone("Africa/Cairo")


class TimeStampedModel(SQLModel):
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(cairo_tz)
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(cairo_tz)
    )


class Page(TimeStampedModel, table=True):
    __tablename__ = "page"

    id: int | None = Field(default=None, primary_key=True)
    path: str
    en_title: str
    ar_title: str
    en_description: str | None = None
    ar_description: str | None = None
    icon: str | None = None
    updated_by: int | None = Field(default=None, foreign_key="account.id")

    # Relationships
    updated_by_account: Optional["Account"] = Relationship(
        back_populates="pages_updated",
        sa_relationship_kwargs={"foreign_keys": "[Page.updated_by]"},
    )
    role_page_permissions: List["RolePagePermission"] = Relationship(
        back_populates="page",
        sa_relationship_kwargs={
            "foreign_keys": "[RolePagePermission.page_id]"
        },
    )


class Role(TimeStampedModel, table=True):
    __tablename__ = "role"

    id: int | None = Field(default=None, primary_key=True)
    en_name: str | None = None
    ar_name: str | None = None
    ar_description: str | None = None
    en_description: str | None = None
    updated_by: int | None = Field(default=None, foreign_key="account.id")

    # Relationships
    accounts: List["Account"] = Relationship(
        back_populates="role",
        sa_relationship_kwargs={"foreign_keys": "[Account.role_id]"},
    )
    account_permissions: List["AccountPermission"] = Relationship(
        back_populates="role",
        sa_relationship_kwargs={"foreign_keys": "[AccountPermission.role_id]"},
    )
    updated_by_account: Optional["Account"] = Relationship(
        back_populates="roles_updated",
        sa_relationship_kwargs={
            "foreign_keys": "[Role.updated_by]",
            "remote_side": "[Account.id]",
        },
    )
    role_page_permissions: List["RolePagePermission"] = Relationship(
        back_populates="role",
        sa_relationship_kwargs={
            "foreign_keys": "[RolePagePermission.role_id]"
        },
    )


class Account(TimeStampedModel, table=True):
    __tablename__ = "account"

    id: int | None = Field(default=None, primary_key=True)
    username: str
    password: str | None = None
    is_domain: bool = False
    is_super_admin: bool = False
    is_active: bool = True
    title: str | None = None
    fullname: str | None = None
    email: str | None = None
    role_id: int | None = Field(default=None, foreign_key="role.id")
    updated_by: int | None = Field(default=None, foreign_key="account.id")

    # Relationships
    role: Role | None = Relationship(
        back_populates="accounts",
        sa_relationship_kwargs={"foreign_keys": "[Account.role_id]"},
    )
    account_permissions: List["AccountPermission"] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={
            "foreign_keys": "[AccountPermission.account_id]"
        },
    )
    updated_by_account: Optional["Account"] = Relationship(
        back_populates="accounts_updated",
        sa_relationship_kwargs={
            "foreign_keys": "[Account.updated_by]",
            "remote_side": "[Account.id]",
        },
    )
    accounts_updated: List["Account"] = Relationship(
        back_populates="updated_by_account",
        sa_relationship_kwargs={"foreign_keys": "[Account.updated_by]"},
    )
    roles_updated: List[Role] = Relationship(
        back_populates="updated_by_account",
        sa_relationship_kwargs={"foreign_keys": "[Role.updated_by]"},
    )
    pages_updated: List[Page] = Relationship(
        back_populates="updated_by_account",
        sa_relationship_kwargs={"foreign_keys": "[Page.updated_by]"},
    )
    role_page_permissions_updated: List["RolePagePermission"] = Relationship(
        back_populates="updated_by_account",
        sa_relationship_kwargs={
            "foreign_keys": "[RolePagePermission.updated_by]"
        },
    )
    branches_updated: List["Branch"] = Relationship(
        back_populates="updated_by_account",
        sa_relationship_kwargs={"foreign_keys": "[Branch.updated_by]"},
    )
    units_updated: List["Unit"] = Relationship(
        back_populates="updated_by_account",
        sa_relationship_kwargs={"foreign_keys": "[Unit.updated_by]"},
    )
    audit_logs: List["AuditLog"] = Relationship(
        back_populates="changed_by_account",
        sa_relationship_kwargs={"foreign_keys": "[AuditLog.changed_by]"},
    )


class RolePagePermission(TimeStampedModel, table=True):
    __tablename__ = "role_page_permission"

    id: int | None = Field(default=None, primary_key=True)
    role_id: int = Field(foreign_key="role.id")
    page_id: int = Field(foreign_key="page.id")
    can_view: bool = True
    can_create: bool = False
    can_edit: bool = False
    can_delete: bool = False
    updated_by: int | None = Field(default=None, foreign_key="account.id")

    # Relationships
    role: Role = Relationship(
        back_populates="role_page_permissions",
        sa_relationship_kwargs={
            "foreign_keys": "[RolePagePermission.role_id]"
        },
    )
    page: Page = Relationship(
        back_populates="role_page_permissions",
        sa_relationship_kwargs={
            "foreign_keys": "[RolePagePermission.page_id]"
        },
    )
    updated_by_account: Account | None = Relationship(
        back_populates="role_page_permissions_updated",
        sa_relationship_kwargs={
            "foreign_keys": "[RolePagePermission.updated_by]"
        },
    )


class AccountPermission(SQLModel, table=True):
    __tablename__ = "account_permission"

    id: int | None = Field(default=None, primary_key=True)
    account_id: int = Field(foreign_key="account.id")
    role_id: int = Field(foreign_key="role.id")

    user: Account = Relationship(
        back_populates="account_permissions",
        sa_relationship_kwargs={
            "foreign_keys": "[AccountPermission.account_id]"
        },
    )
    role: Role = Relationship(
        back_populates="account_permissions",
        sa_relationship_kwargs={"foreign_keys": "[AccountPermission.role_id]"},
    )


class Branch(TimeStampedModel, table=True):
    __tablename__ = "branch"

    id: int | None = Field(default=None, primary_key=True)
    branch_name: str
    address: str | None = None
    contact_info: str | None = None
    updated_by: int | None = Field(default=None, foreign_key="account.id")

    updated_by_account: Account | None = Relationship(
        back_populates="branches_updated",
        sa_relationship_kwargs={"foreign_keys": "[Branch.updated_by]"},
    )
    branch_units: List["BranchUnit"] = Relationship(back_populates="branch")


class Unit(TimeStampedModel, table=True):
    __tablename__ = "unit"

    id: int | None = Field(default=None, primary_key=True)
    unit_name: str
    updated_by: int | None = Field(default=None, foreign_key="account.id")

    updated_by_account: Account | None = Relationship(
        back_populates="units_updated",
        sa_relationship_kwargs={"foreign_keys": "[Unit.updated_by]"},
    )
    unit_profiles: List["UnitProfile"] = Relationship(back_populates="unit")


class UnitProfile(TimeStampedModel, table=True):
    __tablename__ = "unit_profile"

    id: int | None = Field(default=None, primary_key=True)
    unit_id: int = Field(foreign_key="unit.id")
    visit_validity_hours: int
    voucher_expiry_hours: int
    updated_by: int | None = Field(default=None, foreign_key="account.id")

    unit: Unit = Relationship(back_populates="unit_profiles")
    branch_units: List["BranchUnit"] = Relationship(
        back_populates="unit_profile"
    )


class BranchUnit(TimeStampedModel, table=True):
    __tablename__ = "branch_unit"

    id: int | None = Field(default=None, primary_key=True)
    branch_id: int = Field(foreign_key="branch.id")
    unit_profile_id: int = Field(foreign_key="unit_profile.id")
    network_subnet: str | None = None
    validation_duration_hours: int
    sophos_url: str | None = None
    updated_by: int | None = Field(default=None, foreign_key="account.id")

    branch: Branch = Relationship(back_populates="branch_units")
    unit_profile: UnitProfile = Relationship(back_populates="branch_units")
    reservations: List["Reservation"] = Relationship(
        back_populates="branch_unit"
    )


class Phone(TimeStampedModel, table=True):
    __tablename__ = "phone"

    id: int | None = Field(default=None, primary_key=True)
    phone_number: str
    is_blocked: bool = False
    updated_by: int | None = Field(default=None, foreign_key="account.id")

    patients: List["Patient"] = Relationship(back_populates="phone")
    login_logs: List["LoginLog"] = Relationship(back_populates="phone")


class Patient(TimeStampedModel, table=True):
    __tablename__ = "patient"

    id: int | None = Field(default=None, primary_key=True)
    phone_id: int = Field(foreign_key="phone.id")
    patient_name: str
    updated_by: int | None = Field(default=None, foreign_key="account.id")

    phone: Phone = Relationship(back_populates="patients")
    reservations: List["Reservation"] = Relationship(back_populates="patient")


class User(TimeStampedModel, table=True):
    __tablename__ = "user"

    id: int | None = Field(default=None, primary_key=True)
    username: str
    fullname: str | None = None
    title: str | None = None
    updated_by: int | None = Field(default=None, foreign_key="account.id")

    reservations_created: List["Reservation"] = Relationship(
        back_populates="created_by_user"
    )


class VoucherStatus(TimeStampedModel, table=True):
    __tablename__ = "voucher_status"

    id: int | None = Field(default=None, primary_key=True)
    status: str
    updated_by: int | None = Field(default=None, foreign_key="account.id")

    vouchers: List["Voucher"] = Relationship(back_populates="status")


class Reservation(TimeStampedModel, table=True):
    __tablename__ = "reservation"

    id: int | None = Field(default=None, primary_key=True)
    patient_id: int = Field(foreign_key="patient.id")
    branch_unit_id: int = Field(foreign_key="branch_unit.id")
    reservation_time: datetime = Field(
        default_factory=lambda: datetime.now(cairo_tz)
    )
    created_by: int = Field(foreign_key="user.id")
    updated_by: int | None = Field(default=None, foreign_key="account.id")

    patient: Patient = Relationship(back_populates="reservations")
    branch_unit: BranchUnit = Relationship(back_populates="reservations")
    created_by_user: User = Relationship(back_populates="reservations_created")
    vouchers: List["Voucher"] = Relationship(back_populates="reservation")


class Voucher(TimeStampedModel, table=True):
    __tablename__ = "voucher"

    id: int | None = Field(default=None, primary_key=True)
    reservation_id: int = Field(foreign_key="reservation.id")
    code: str
    voucher_status_id: int = Field(foreign_key="voucher_status.id")
    expired_at: datetime | None = None
    renewed_at: datetime | None = None
    renewal_count: int = 0
    updated_by: int | None = Field(default=None, foreign_key="account.id")

    reservation: Reservation = Relationship(back_populates="vouchers")
    status: VoucherStatus = Relationship(back_populates="vouchers")


class LoginLog(SQLModel, table=True):
    __tablename__ = "login_log"

    id: int | None = Field(default=None, primary_key=True)
    phone_id: int = Field(foreign_key="phone.id")
    device_ip: str
    event_time: datetime = Field(
        default_factory=lambda: datetime.now(cairo_tz)
    )
    is_successful: bool
    result: str | None = None
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(cairo_tz)
    )
    updated_by: int | None = Field(default=None, foreign_key="account.id")

    phone: Phone = Relationship(back_populates="login_logs")


class AuditLog(SQLModel, table=True):
    __tablename__ = "audit_log"

    id: int | None = Field(default=None, primary_key=True)
    table_name: str
    record_id: int
    operation: str
    changed_at: datetime = Field(
        default_factory=lambda: datetime.now(cairo_tz)
    )
    changed_by: int = Field(foreign_key="account.id")

    changed_by_account: Account = Relationship(
        back_populates="audit_logs",
        sa_relationship_kwargs={"foreign_keys": "[AuditLog.changed_by]"},
    )
    details: List["AuditLogDetail"] = Relationship(back_populates="audit_log")


class AuditLogDetail(SQLModel, table=True):
    __tablename__ = "audit_log_detail"

    id: int | None = Field(default=None, primary_key=True)
    audit_log_id: int = Field(foreign_key="audit_log.id")
    column_name: str
    old_value: str | None = None
    new_value: str | None = None

    audit_log: AuditLog = Relationship(back_populates="details")
