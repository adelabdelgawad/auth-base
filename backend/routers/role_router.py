import logging
from fastapi import APIRouter, HTTPException, status
from sqlmodel import select
from typing import List
from db.models import Role
from core.dependencies import SessionDep

router = APIRouter(prefix="/roles", tags=["Role"])
logger = logging.getLogger("Role")


@router.get("/", response_model=List[Role])
async def read_roles(session: SessionDep):
    try:
        logger.info("Reading all roles")
        result = await session.execute(select(Role))
        return result.scalars().all()
    except Exception as e:
        logger.error(f"Error reading roles: {e}")
        raise HTTPException(500, "Internal server error")


@router.get("/{id}", response_model=Role)
async def read_role(id: int, session: SessionDep):
    try:
        logger.info(f"Reading role {id}")
        role = await session.get(Role, id)
        if not role:
            logger.warning(f"Role {id} not found")
            raise HTTPException(404, "Role not found")
        return role
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error reading role {id}: {e}")
        raise HTTPException(500, "Internal server error")


@router.post("/", response_model=Role, status_code=status.HTTP_201_CREATED)
async def create_role(role: Role, session: SessionDep):
    try:
        logger.info("Creating role")
        session.add(role)
        await session.commit()
        await session.refresh(role)
        return role
    except Exception as e:
        logger.error(f"Error creating role: {e}")
        raise HTTPException(500, "Internal server error")


@router.put("/{id}", response_model=Role)
async def update_role(id: int, role_data: Role, session: SessionDep):
    try:
        logger.info(f"Updating role {id}")
        role = await session.get(Role, id)
        if not role:
            logger.warning(f"Role {id} not found")
            raise HTTPException(404, "Role not found")
        for key, value in role_data.dict(exclude_unset=True).items():
            setattr(role, key, value)
        session.add(role)
        await session.commit()
        await session.refresh(role)
        return role
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating role {id}: {e}")
        raise HTTPException(500, "Internal server error")


@router.delete("/{id}")
async def delete_role(id: int, session: SessionDep):
    try:
        logger.info(f"Deleting role {id}")
        role = await session.get(Role, id)
        if not role:
            logger.warning(f"Role {id} not found")
            raise HTTPException(404, "Role not found")
        await session.delete(role)
        await session.commit()
        return {"ok": True}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting role {id}: {e}")
        raise HTTPException(500, "Internal server error")
