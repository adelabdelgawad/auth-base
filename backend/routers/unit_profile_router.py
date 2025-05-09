import logging
from fastapi import APIRouter, HTTPException, status
from sqlmodel import select
from typing import List
from db.models import UnitProfile
from core.dependencies import SessionDep

router = APIRouter(prefix="/unit-profiles", tags=["UnitProfile"])
logger = logging.getLogger("UnitProfile")


@router.get("/", response_model=List[UnitProfile])
async def read_unit_profiles(session: SessionDep):
    try:
        logger.info("Reading all unit profiles")
        result = await session.execute(select(UnitProfile))
        return result.scalars().all()
    except Exception as e:
        logger.error(f"Error reading unit profiles: {e}")
        raise HTTPException(500, "Internal server error")


@router.get("/{id}", response_model=UnitProfile)
async def read_unit_profile(id: int, session: SessionDep):
    try:
        logger.info(f"Reading unit profile {id}")
        unit_profile = await session.get(UnitProfile, id)
        if not unit_profile:
            logger.warning(f"UnitProfile {id} not found")
            raise HTTPException(404, "UnitProfile not found")
        return unit_profile
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error reading unit profile {id}: {e}")
        raise HTTPException(500, "Internal server error")


@router.post(
    "/", response_model=UnitProfile, status_code=status.HTTP_201_CREATED
)
async def create_unit_profile(unit_profile: UnitProfile, session: SessionDep):
    try:
        logger.info("Creating unit profile")
        session.add(unit_profile)
        await session.commit()
        await session.refresh(unit_profile)
        return unit_profile
    except Exception as e:
        logger.error(f"Error creating unit profile: {e}")
        raise HTTPException(500, "Internal server error")


@router.put("/{id}", response_model=UnitProfile)
async def update_unit_profile(
    id: int, unit_profile_data: UnitProfile, session: SessionDep
):
    try:
        logger.info(f"Updating unit profile {id}")
        unit_profile = await session.get(UnitProfile, id)
        if not unit_profile:
            logger.warning(f"UnitProfile {id} not found")
            raise HTTPException(404, "UnitProfile not found")
        for key, value in unit_profile_data.dict(exclude_unset=True).items():
            setattr(unit_profile, key, value)
        session.add(unit_profile)
        await session.commit()
        await session.refresh(unit_profile)
        return unit_profile
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating unit profile {id}: {e}")
        raise HTTPException(500, "Internal server error")


@router.delete("/{id}")
async def delete_unit_profile(id: int, session: SessionDep):
    try:
        logger.info(f"Deleting unit profile {id}")
        unit_profile = await session.get(UnitProfile, id)
        if not unit_profile:
            logger.warning(f"UnitProfile {id} not found")
            raise HTTPException(404, "UnitProfile not found")
        await session.delete(unit_profile)
        await session.commit()
        return {"ok": True}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting unit profile {id}: {e}")
        raise HTTPException(500, "Internal server error")
