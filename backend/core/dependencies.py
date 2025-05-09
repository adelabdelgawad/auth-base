from typing import Annotated

import pytz
from fastapi import Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from core.schema import DomainUser
from db.database import get_application_session

# Define your secret key and algorithm
SESSION_SECRET = settings.SESSION_SECRET

ALGORITHM = "HS256"

# OAuth2 scheme for token extraction
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Default timezone
cairo_tz = pytz.timezone("Africa/Cairo")


async def decrypt(token: str):
    try:
        payload = jwt.decode(token, SESSION_SECRET, algorithms=[ALGORITHM])
        return payload
    except JWTError as e:
        print(f"Token verification failed: {e}")
        raise HTTPException(status_code=401, detail="Invalid or expired token")


async def get_current_user(request: Request):
    auth = request.headers.get("Authorization")
    if not auth or not auth.startswith("Bearer "):
        raise HTTPException(401, "Not authenticated")
    token = auth.split(" ", 1)[1]
    try:
        payload = await decrypt(token)
        user = payload["user"]

        return DomainUser(
            id=user["id"],
            username=user["username"],
            fullname=user["fullname"],
            title=user["title"],
            email=user["email"],
        )
    except Exception as e:
        raise HTTPException(401, "Invalid token")


# --- Dependency Injection Annotations ---

SessionDep = Annotated[AsyncSession, Depends(get_application_session)]


CurrentUserDep = Annotated[DomainUser, Depends(get_current_user)]
