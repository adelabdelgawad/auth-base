import logging
from fastapi import APIRouter, HTTPException, status
from sqlmodel import select
from typing import List
from db.models import AuditLogDetail
from core.dependencies import SessionDep

router = APIRouter(prefix="/audit-log-details", tags=["AuditLogDetail"])
logger = logging.getLogger("AuditLogDetail")


@router.get("/", response_model=List[AuditLogDetail])
async def read_audit_log_details(session: SessionDep):
    try:
        logger.info("Reading all audit log details")
        result = await session.execute(select(AuditLogDetail))
        return result.scalars().all()
    except Exception as e:
        logger.error(f"Error reading audit log details: {e}")
        raise HTTPException(500, "Internal server error")


@router.get("/{id}", response_model=AuditLogDetail)
async def read_audit_log_detail(id: int, session: SessionDep):
    try:
        logger.info(f"Reading audit log detail {id}")
        audit_log_detail = await session.get(AuditLogDetail, id)
        if not audit_log_detail:
            logger.warning(f"AuditLogDetail {id} not found")
            raise HTTPException(404, "AuditLogDetail not found")
        return audit_log_detail
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error reading audit log detail {id}: {e}")
        raise HTTPException(500, "Internal server error")


@router.post(
    "/", response_model=AuditLogDetail, status_code=status.HTTP_201_CREATED
)
async def create_audit_log_detail(
    audit_log_detail: AuditLogDetail, session: SessionDep
):
    try:
        logger.info("Creating audit log detail")
        session.add(audit_log_detail)
        await session.commit()
        await session.refresh(audit_log_detail)
        return audit_log_detail
    except Exception as e:
        logger.error(f"Error creating audit log detail: {e}")
        raise HTTPException(500, "Internal server error")


@router.put("/{id}", response_model=AuditLogDetail)
async def update_audit_log_detail(
    id: int, audit_log_detail_data: AuditLogDetail, session: SessionDep
):
    try:
        logger.info(f"Updating audit log detail {id}")
        audit_log_detail = await session.get(AuditLogDetail, id)
        if not audit_log_detail:
            logger.warning(f"AuditLogDetail {id} not found")
            raise HTTPException(404, "AuditLogDetail not found")
        for key, value in audit_log_detail_data.dict(
            exclude_unset=True
        ).items():
            setattr(audit_log_detail, key, value)
        session.add(audit_log_detail)
        await session.commit()
        await session.refresh(audit_log_detail)
        return audit_log_detail
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating audit log detail {id}: {e}")
        raise HTTPException(500, "Internal server error")


@router.delete("/{id}")
async def delete_audit_log_detail(id: int, session: SessionDep):
    try:
        logger.info(f"Deleting audit log detail {id}")
        audit_log_detail = await session.get(AuditLogDetail, id)
        if not audit_log_detail:
            logger.warning(f"AuditLogDetail {id} not found")
            raise HTTPException(404, "AuditLogDetail not found")
        await session.delete(audit_log_detail)
        await session.commit()
        return {"ok": True}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting audit log detail {id}: {e}")
        raise HTTPException(500, "Internal server error")
