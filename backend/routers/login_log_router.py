import logging
from fastapi import APIRouter, HTTPException, status
from sqlmodel import select
from typing import List
from db.models import LoginLog
from core.dependencies import SessionDep

router = APIRouter(prefix="/login-logs", tags=["LoginLog"])
logger = logging.getLogger("LoginLog")


@router.get("/", response_model=List[LoginLog])
async def read_login_logs(session: SessionDep):
    try:
        logger.info("Reading all login logs")
        result = await session.execute(select(LoginLog))
        return result.scalars().all()
    except Exception as e:
        logger.error(f"Error reading login logs: {e}")
        raise HTTPException(500, "Internal server error")


@router.get("/{id}", response_model=LoginLog)
async def read_login_log(id: int, session: SessionDep):
    try:
        logger.info(f"Reading login log {id}")
        login_log = await session.get(LoginLog, id)
        if not login_log:
            logger.warning(f"LoginLog {id} not found")
            raise HTTPException(404, "LoginLog not found")
        return login_log
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error reading login log {id}: {e}")
        raise HTTPException(500, "Internal server error")


@router.post("/", response_model=LoginLog, status_code=status.HTTP_201_CREATED)
async def create_login_log(login_log: LoginLog, session: SessionDep):
    try:
        logger.info("Creating login log")
        session.add(login_log)
        await session.commit()
        await session.refresh(login_log)
        return login_log
    except Exception as e:
        logger.error(f"Error creating login log: {e}")
        raise HTTPException(500, "Internal server error")


@router.put("/{id}", response_model=LoginLog)
async def update_login_log(
    id: int, login_log_data: LoginLog, session: SessionDep
):
    try:
        logger.info(f"Updating login log {id}")
        login_log = await session.get(LoginLog, id)
        if not login_log:
            logger.warning(f"LoginLog {id} not found")
            raise HTTPException(404, "LoginLog not found")
        for key, value in login_log_data.dict(exclude_unset=True).items():
            setattr(login_log, key, value)
        session.add(login_log)
        await session.commit()
        await session.refresh(login_log)
        return login_log
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating login log {id}: {e}")
        raise HTTPException(500, "Internal server error")


@router.delete("/{id}")
async def delete_login_log(id: int, session: SessionDep):
    try:
        logger.info(f"Deleting login log {id}")
        login_log = await session.get(LoginLog, id)
        if not login_log:
            logger.warning(f"LoginLog {id} not found")
            raise HTTPException(404, "LoginLog not found")
        await session.delete(login_log)
        await session.commit()
        return {"ok": True}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting login log {id}: {e}")
        raise HTTPException(500, "Internal server error")
