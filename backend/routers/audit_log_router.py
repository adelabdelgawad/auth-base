import logging
from fastapi import APIRouter, HTTPException, status
from sqlmodel import select
from typing import List
from db.models import AuditLog
from core.dependencies import SessionDep

router = APIRouter(prefix="/audit-logs", tags=["AuditLog"])
logger = logging.getLogger("AuditLog")


@router.get("/", response_model=List[AuditLog])
async def read_audit_logs(session: SessionDep):
    try:
        logger.info("Reading all audit logs")
        result = await session.execute(select(AuditLog))
        return result.scalars().all()
    except Exception as e:
        logger.error(f"Error reading audit logs: {e}")
        raise HTTPException(500, "Internal server error")


@router.get("/{id}", response_model=AuditLog)
async def read_audit_log(id: int, session: SessionDep):
    try:
        logger.info(f"Reading audit log {id}")
        audit_log = await session.get(AuditLog, id)
        if not audit_log:
            logger.warning(f"AuditLog {id} not found")
            raise HTTPException(404, "AuditLog not found")
        return audit_log
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error reading audit log {id}: {e}")
        raise HTTPException(500, "Internal server error")


@router.post("/", response_model=AuditLog, status_code=status.HTTP_201_CREATED)
async def create_audit_log(audit_log: AuditLog, session: SessionDep):
    try:
        logger.info("Creating audit log")
        session.add(audit_log)
        await session.commit()
        await session.refresh(audit_log)
        return audit_log
    except Exception as e:
        logger.error(f"Error creating audit log: {e}")
        raise HTTPException(500, "Internal server error")


@router.put("/{id}", response_model=AuditLog)
async def update_audit_log(
    id: int, audit_log_data: AuditLog, session: SessionDep
):
    try:
        logger.info(f"Updating audit log {id}")
        audit_log = await session.get(AuditLog, id)
        if not audit_log:
            logger.warning(f"AuditLog {id} not found")
            raise HTTPException(404, "AuditLog not found")
        for key, value in audit_log_data.dict(exclude_unset=True).items():
            setattr(audit_log, key, value)
        session.add(audit_log)
        await session.commit()
        await session.refresh(audit_log)
        return audit_log
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating audit log {id}: {e}")
        raise HTTPException(500, "Internal server error")


@router.delete("/{id}")
async def delete_audit_log(id: int, session: SessionDep):
    try:
        logger.info(f"Deleting audit log {id}")
        audit_log = await session.get(AuditLog, id)
        if not audit_log:
            logger.warning(f"AuditLog {id} not found")
            raise HTTPException(404, "AuditLog not found")
        await session.delete(audit_log)
        await session.commit()
        return {"ok": True}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting audit log {id}: {e}")
        raise HTTPException(500, "Internal server error")
