import logging
from datetime import datetime, timedelta
from typing import List, Optional

import icecream
from fastapi import APIRouter, HTTPException, status
from fastapi.exceptions import RequestValidationError
from jose import JWTError, jwt
from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from config import Settings
from core.active_directory import ActiveDirectoryService
from core.dependencies import SessionDep
from core.http_schemas import LoginRequest, RefreshTokenRequest, TokenResponse
from core.password_hash import verify_hashed_password
from core.schema import DomainUserWithRoles
from db.models import Account, AccountPermission, Role
from exceptions import InternalServerException, InvalidCredentialsException

logger = logging.getLogger(__name__)
router = APIRouter(tags=["auth"])
settings = Settings()


async def read_account(
    session: AsyncSession,
    username: Optional[str] = None,
    account_id: Optional[int] = None,
) -> Optional[Account]:
    """Retrieve a Account object by username."""
    logger.debug(f"Attempting to retrieve account: {username}")
    try:
        statement = select(Account)
        if username:
            statement = statement.where(Account.username == username)
        elif account_id:
            statement = statement.where(Account.id == account_id)
        else:
            logger.error("read_account called without username or account_id.")
            raise InternalServerException(
                "Cannot fetch account without identifier."
            )
        result = await session.execute(statement)
        account = result.scalar_one_or_none()
        if account:
            logger.debug(f"Account '{username}' found with ID: {account.id}")
        else:
            logger.warning(f"Account '{username}' not found in database.")
        return account
    except Exception as e:
        logger.error(
            f"Database error retrieving account '{username}': {e}",
            exc_info=True,
        )
        raise InternalServerException("Error accessing account data.")


async def read_account_roles_ids(
    session: AsyncSession, account_id: int
) -> List[int]:
    """
    Retrieve all role names assigned to a specific account.
    """
    logger.debug(f"Retrieving role names for account_id: {account_id}")
    if account_id is None:
        logger.error("read_account_roles_ids called without a account_id.")
        raise InternalServerException(
            "Cannot fetch roles without account identifier."
        )
    try:
        statement = (
            select(Role.id)
            .join(AccountPermission, AccountPermission.role_id == Role.id)
            .where(AccountPermission.account_id == account_id)
        )
        results = await session.execute(statement)
        role_names = results.scalars().all()
        logger.debug(
            f"Found {len(role_names)} role(s) for account_id: {account_id}"
        )
        return role_names
    except Exception as e:
        logger.error(
            f"Database error retrieving roles for account_id {account_id}: {e}",
            exc_info=True,
        )
        raise InternalServerException("Error accessing account role data.")


async def create_access_token(
    data: dict, expires_delta: Optional[timedelta] = None
) -> tuple[str, int]:
    """
    Create a signed JWT access token.
    Returns (token, expires_at_ms).
    """
    to_encode = data.copy()
    now = datetime.now()
    expire = now + (
        expires_delta
        or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"iat": now, "exp": expire})
    token = jwt.encode(
        claims=to_encode,
        key=settings.SESSION_SECRET,
        algorithm=settings.ALGORITHM,
    )
    return token, int(expire.timestamp() * 1000)


async def create_refresh_token(account_id: int) -> str:
    """
    Create a signed JWT refresh token.
    Embeds a "type" claim for easy validation.
    """
    now = datetime.now()
    expire = now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    payload = {
        "sub": f"refresh_{account_id}",
        "type": "refresh",
        "iat": now,
        "exp": expire,
    }
    return jwt.encode(
        claims=payload,
        key=settings.SESSION_SECRET,
        algorithm=settings.ALGORITHM,
    )


async def decode_refresh_token(token: str) -> int:
    """
    Verify and decode a refresh token.
    Returns the integer account_id on success.
    """
    try:
        print(f"Decoding refresh token: {token}")
        payload = jwt.decode(
            token,
            settings.SESSION_SECRET,
            algorithms=[settings.ALGORITHM],
        )
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={
                    "error": "Invalid credentials",
                    "code": "INVALID_LOGIN",
                },
            )
        return int(payload["sub"].split("_", 1)[1])
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )
    except (ValueError, IndexError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Malformed refresh token",
        )


@router.post("/login", response_model=TokenResponse)
async def login(session: SessionDep, form_data: LoginRequest):
    """
    Authenticate account via local DB (for admin) or Active Directory,
    retrieve account data/roles, and return an access token.
    """
    username = form_data.username
    password = form_data.password

    logger.info(f"Login attempt for account: {username}")

    # 1. Validate input
    if not username or not password:
        logger.warning(
            f"Login failed for '{username}': Missing username or password."
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Accountname and password are required.",
        )

    try:
        # 2. Find account in the local database first
        account = await read_account(session, username=username)

        if not account:
            logger.warning(
                f"Login failed: Account '{username}' not found in local database."
            )
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Account not found.",
            )

        # 3. Perform Authentication
        if username == "admin":
            logger.debug(
                f"Attempting local authentication for admin account: {username}"
            )
            if not account.password:
                logger.error(
                    f"Admin account '{username}' has no password set in the database."
                )
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Configuration error for admin account.",
                )

            if not verify_hashed_password(password, account.password):

                logger.warning(
                    f"Local authentication failed for admin account: {username}"
                )
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid Accountname or Password",
                )
            logger.info(
                f"Admin account '{username}' authenticated successfully locally."
            )
        else:
            logger.debug(
                f"Attempting Active Directory authentication for account: {username}"
            )
            ad_connection = ActiveDirectoryService(username, password)
            ad_account_info = (
                await ad_connection.get_account_info_if_authenticated()
            )
            if not ad_account_info:
                logger.warning(
                    f"Active Directory authentication failed for account: {username}"
                )
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid username or password.",
                )
            logger.info(
                f"Active Directory authentication successful for account: {username}"
            )

        # 4. Fetch Account Roles
        if account.id is None:
            logger.error(
                f"Account '{username}' found but has no ID. Cannot fetch roles."
            )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Account data inconsistency.",
            )

        roles = await read_account_roles_ids(session, account.id)
        logger.info(
            f"Retrieved {len(roles)} role(s) for account_id: {account.id}"
        )

        # 5. Prepare Account Data for Token
        base_data = account.model_dump(exclude={"password"})
        try:
            account_attrs = DomainUserWithRoles(**base_data, roles=roles)
        except ValidationError as e:
            logger.error(
                f"Failed to create DomainUserWithRoles for token for account {username}: {e}",
                exc_info=True,
            )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error preparing account data for token.",
            )

        # 6. Create Token
        account_dict = {"account": account_attrs.model_dump()}
        access_token, expires_at = await create_access_token(account_dict)
        refresh_token = await create_refresh_token(account.id)
        logger.info(f"Token created successfully for account: {username}")

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_at=expires_at,
        )

    except HTTPException:
        # Already handled above, just re-raise
        raise
    except RequestValidationError as val_err:
        logger.error(
            f"Request validation error for '{username}': {val_err}",
            exc_info=True,
        )
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=val_err.errors(),
        )
    except Exception as e:
        logger.error(
            f"Unexpected error during login for {username}: {e}", exc_info=True
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error.",
        )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(session: SessionDep, request: RefreshTokenRequest):
    """
    Handle refresh token requests and issue new tokens.
    """
    try:
        account_id = await decode_refresh_token(request.refresh_token)
        logger.info(f"Decoded account_id from refresh token: {account_id}")
        account = await read_account(session, account_id=account_id)
        roles = await read_account_roles_ids(session, account.id)
        try:
            account_attrs = DomainUserWithRoles(
                **account.model_dump(exclude={"password"}), roles=roles
            )
        except ValidationError as e:
            logger.error(
                f"Failed to create DomainUserWithRoles for token for account {account.username}: {e}",
                exc_info=True,
            )
            raise InternalServerException(
                "Error preparing account data for token."
            )
        account_dict = {"account": account_attrs.model_dump()}
        access_token, expires_at = await create_access_token(
            data=account_dict,
            expires_delta=timedelta(
                minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
            ),
        )

        new_refresh_token = await create_refresh_token(account_id)

        logger.info(f"Generated new tokens with expiry: {expires_at}")
        return TokenResponse(
            access_token=access_token,
            refresh_token=new_refresh_token,
            expires_at=expires_at,
        )
    except HTTPException as e:
        logger.error(f"HTTP error in refresh: {e.detail}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error in refresh: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Token refresh failed: {str(e)}",
        )
