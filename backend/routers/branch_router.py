import logging
from fastapi import APIRouter, HTTPException, status
from sqlmodel import select
from typing import List
from db.models import Branch
from core.dependencies import SessionDep

router = APIRouter(prefix="/branches", tags=["Branch"])
logger = logging.getLogger("Branch")


@router.get("/", response_model=List[Branch])
async def read_branches(session: SessionDep):
    try:
        logger.info("Reading all branches")
        result = await session.execute(select(Branch))
        return result.scalars().all()
    except Exception as e:
        logger.error(f"Error reading branches: {e}")
        raise HTTPException(500, "Internal server error")


@router.get("/{id}", response_model=Branch)
async def read_branch(id: int, session: SessionDep):
    try:
        logger.info(f"Reading branch {id}")
        branch = await session.get(Branch, id)
        if not branch:
            logger.warning(f"Branch {id} not found")
            raise HTTPException(404, "Branch not found")
        return branch
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error reading branch {id}: {e}")
        raise HTTPException(500, "Internal server error")


@router.post("/", response_model=Branch, status_code=status.HTTP_201_CREATED)
async def create_branch(branch: Branch, session: SessionDep):
    try:
        logger.info("Creating branch")
        session.add(branch)
        await session.commit()
        await session.refresh(branch)
        return branch
    except Exception as e:
        logger.error(f"Error creating branch: {e}")
        raise HTTPException(500, "Internal server error")


@router.put("/{id}", response_model=Branch)
async def update_branch(id: int, branch_data: Branch, session: SessionDep):
    try:
        logger.info(f"Updating branch {id}")
        branch = await session.get(Branch, id)
        if not branch:
            logger.warning(f"Branch {id} not found")
            raise HTTPException(404, "Branch not found")
        for key, value in branch_data.dict(exclude_unset=True).items():
            setattr(branch, key, value)
        session.add(branch)
        await session.commit()
        await session.refresh(branch)
        return branch
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating branch {id}: {e}")
        raise HTTPException(500, "Internal server error")


@router.delete("/{id}")
async def delete_branch(id: int, session: SessionDep):
    try:
        logger.info(f"Deleting branch {id}")
        branch = await session.get(Branch, id)
        if not branch:
            logger.warning(f"Branch {id} not found")
            raise HTTPException(404, "Branch not found")
        await session.delete(branch)
        await session.commit()
        return {"ok": True}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting branch {id}: {e}")
        raise HTTPException(500, "Internal server error")
