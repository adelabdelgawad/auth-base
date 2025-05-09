import logging
from fastapi import APIRouter, HTTPException, status
from sqlmodel import select
from typing import List
from db.models import BranchUnit
from core.dependencies import SessionDep

router = APIRouter(prefix="/branch-units", tags=["BranchUnit"])
logger = logging.getLogger("BranchUnit")


@router.get("/", response_model=List[BranchUnit])
async def read_branch_units(session: SessionDep):
    try:
        logger.info("Reading all branch units")
        result = await session.execute(select(BranchUnit))
        return result.scalars().all()
    except Exception as e:
        logger.error(f"Error reading branch units: {e}")
        raise HTTPException(500, "Internal server error")


@router.get("/{id}", response_model=BranchUnit)
async def read_branch_unit(id: int, session: SessionDep):
    try:
        logger.info(f"Reading branch unit {id}")
        branch_unit = await session.get(BranchUnit, id)
        if not branch_unit:
            logger.warning(f"BranchUnit {id} not found")
            raise HTTPException(404, "BranchUnit not found")
        return branch_unit
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error reading branch unit {id}: {e}")
        raise HTTPException(500, "Internal server error")


@router.post(
    "/", response_model=BranchUnit, status_code=status.HTTP_201_CREATED
)
async def create_branch_unit(branch_unit: BranchUnit, session: SessionDep):
    try:
        logger.info("Creating branch unit")
        session.add(branch_unit)
        await session.commit()
        await session.refresh(branch_unit)
        return branch_unit
    except Exception as e:
        logger.error(f"Error creating branch unit: {e}")
        raise HTTPException(500, "Internal server error")


@router.put("/{id}", response_model=BranchUnit)
async def update_branch_unit(
    id: int, branch_unit_data: BranchUnit, session: SessionDep
):
    try:
        logger.info(f"Updating branch unit {id}")
        branch_unit = await session.get(BranchUnit, id)
        if not branch_unit:
            logger.warning(f"BranchUnit {id} not found")
            raise HTTPException(404, "BranchUnit not found")
        for key, value in branch_unit_data.dict(exclude_unset=True).items():
            setattr(branch_unit, key, value)
        session.add(branch_unit)
        await session.commit()
        await session.refresh(branch_unit)
        return branch_unit
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating branch unit {id}: {e}")
        raise HTTPException(500, "Internal server error")


@router.delete("/{id}")
async def delete_branch_unit(id: int, session: SessionDep):
    try:
        logger.info(f"Deleting branch unit {id}")
        branch_unit = await session.get(BranchUnit, id)
        if not branch_unit:
            logger.warning(f"BranchUnit {id} not found")
            raise HTTPException(404, "BranchUnit not found")
        await session.delete(branch_unit)
        await session.commit()
        return {"ok": True}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting branch unit {id}: {e}")
        raise HTTPException(500, "Internal server error")
