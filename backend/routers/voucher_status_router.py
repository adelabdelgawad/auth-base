import logging
from fastapi import APIRouter, HTTPException, status
from sqlmodel import select
from typing import List
from db.models import VoucherStatus
from core.dependencies import SessionDep

router = APIRouter(prefix="/voucher-statuses", tags=["VoucherStatus"])
logger = logging.getLogger("VoucherStatus")


@router.get("/", response_model=List[VoucherStatus])
async def read_voucher_statuses(session: SessionDep):
    try:
        logger.info("Reading all voucher statuses")
        result = await session.execute(select(VoucherStatus))
        return result.scalars().all()
    except Exception as e:
        logger.error(f"Error reading voucher statuses: {e}")
        raise HTTPException(500, "Internal server error")


@router.get("/{id}", response_model=VoucherStatus)
async def read_voucher_status(id: int, session: SessionDep):
    try:
        logger.info(f"Reading voucher status {id}")
        voucher_status = await session.get(VoucherStatus, id)
        if not voucher_status:
            logger.warning(f"VoucherStatus {id} not found")
            raise HTTPException(404, "VoucherStatus not found")
        return voucher_status
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error reading voucher status {id}: {e}")
        raise HTTPException(500, "Internal server error")


@router.post(
    "/", response_model=VoucherStatus, status_code=status.HTTP_201_CREATED
)
async def create_voucher_status(
    voucher_status: VoucherStatus, session: SessionDep
):
    try:
        logger.info("Creating voucher status")
        session.add(voucher_status)
        await session.commit()
        await session.refresh(voucher_status)
        return voucher_status
    except Exception as e:
        logger.error(f"Error creating voucher status: {e}")
        raise HTTPException(500, "Internal server error")


@router.put("/{id}", response_model=VoucherStatus)
async def update_voucher_status(
    id: int, voucher_status_data: VoucherStatus, session: SessionDep
):
    try:
        logger.info(f"Updating voucher status {id}")
        voucher_status = await session.get(VoucherStatus, id)
        if not voucher_status:
            logger.warning(f"VoucherStatus {id} not found")
            raise HTTPException(404, "VoucherStatus not found")
        for key, value in voucher_status_data.dict(exclude_unset=True).items():
            setattr(voucher_status, key, value)
        session.add(voucher_status)
        await session.commit()
        await session.refresh(voucher_status)
        return voucher_status
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating voucher status {id}: {e}")
        raise HTTPException(500, "Internal server error")


@router.delete("/{id}")
async def delete_voucher_status(id: int, session: SessionDep):
    try:
        logger.info(f"Deleting voucher status {id}")
        voucher_status = await session.get(VoucherStatus, id)
        if not voucher_status:
            logger.warning(f"VoucherStatus {id} not found")
            raise HTTPException(404, "VoucherStatus not found")
        await session.delete(voucher_status)
        await session.commit()
        return {"ok": True}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting voucher status {id}: {e}")
        raise HTTPException(500, "Internal server error")
