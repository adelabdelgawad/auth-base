import logging
from fastapi import APIRouter, HTTPException, status
from sqlmodel import select
from typing import List
from db.models import Unit
from core.dependencies import SessionDep

router = APIRouter(prefix="/units", tags=["Unit"])
logger = logging.getLogger("Unit")


@router.get("/", response_model=List[Unit])
async def read_units(session: SessionDep):
    try:
        logger.info("Reading all units")
        result = await session.execute(select(Unit))
        return result.scalars().all()
    except Exception as e:
        logger.error(f"Error reading units: {e}")
        raise HTTPException(500, "Internal server error")


@router.get("/{id}", response_model=Unit)
async def read_unit(id: int, session: SessionDep):
    try:
        logger.info(f"Reading unit {id}")
        unit = await session.get(Unit, id)
        if not unit:
            logger.warning(f"Unit {id} not found")
            raise HTTPException(404, "Unit not found")
        return unit
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error reading unit {id}: {e}")
        raise HTTPException(500, "Internal server error")


@router.post("/", response_model=Unit, status_code=status.HTTP_201_CREATED)
async def create_unit(unit: Unit, session: SessionDep):
    try:
        logger.info("Creating unit")
        session.add(unit)
        await session.commit()
        await session.refresh(unit)
        return unit
    except Exception as e:
        logger.error(f"Error creating unit: {e}")
        raise HTTPException(500, "Internal server error")


@router.put("/{id}", response_model=Unit)
async def update_unit(id: int, unit_data: Unit, session: SessionDep):
    try:
        logger.info(f"Updating unit {id}")
        unit = await session.get(Unit, id)
        if not unit:
            logger.warning(f"Unit {id} not found")
            raise HTTPException(404, "Unit not found")
        for key, value in unit_data.dict(exclude_unset=True).items():
            setattr(unit, key, value)
        session.add(unit)
        await session.commit()
        await session.refresh(unit)
        return unit
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating unit {id}: {e}")
        raise HTTPException(500, "Internal server error")


@router.delete("/{id}")
async def delete_unit(id: int, session: SessionDep):
    try:
        logger.info(f"Deleting unit {id}")
        unit = await session.get(Unit, id)
        if not unit:
            logger.warning(f"Unit {id} not found")
            raise HTTPException(404, "Unit not found")
        await session.delete(unit)
        await session.commit()
        return {"ok": True}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting unit {id}: {e}")
        raise HTTPException(500, "Internal server error")
