import logging
from fastapi import APIRouter, HTTPException, status
from sqlmodel import select
from typing import List
from db.models import Account
from core.dependencies import SessionDep

router = APIRouter(prefix="/accounts", tags=["Account"])
logger = logging.getLogger("Account")


@router.get("/", response_model=List[Account])
async def read_accounts(session: SessionDep):
    try:
        logger.info("Reading all accounts")
        result = await session.execute(select(Account))
        return result.scalars().all()
    except Exception as e:
        logger.error(f"Error reading accounts: {e}")
        raise HTTPException(500, "Internal server error")


@router.get("/{id}", response_model=Account)
async def read_account(id: int, session: SessionDep):
    try:
        logger.info(f"Reading account {id}")
        account = await session.get(Account, id)
        if not account:
            logger.warning(f"Account {id} not found")
            raise HTTPException(404, "Account not found")
        return account
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error reading account {id}: {e}")
        raise HTTPException(500, "Internal server error")


@router.post("/", response_model=Account, status_code=status.HTTP_201_CREATED)
async def create_account(account: Account, session: SessionDep):
    try:
        logger.info("Creating account")
        session.add(account)
        await session.commit()
        await session.refresh(account)
        return account
    except Exception as e:
        logger.error(f"Error creating account: {e}")
        raise HTTPException(500, "Internal server error")


@router.put("/{id}", response_model=Account)
async def update_account(id: int, account_data: Account, session: SessionDep):
    try:
        logger.info(f"Updating account {id}")
        account = await session.get(Account, id)
        if not account:
            logger.warning(f"Account {id} not found")
            raise HTTPException(404, "Account not found")
        for key, value in account_data.dict(exclude_unset=True).items():
            setattr(account, key, value)
        session.add(account)
        await session.commit()
        await session.refresh(account)
        return account
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating account {id}: {e}")
        raise HTTPException(500, "Internal server error")


@router.delete("/{id}")
async def delete_account(id: int, session: SessionDep):
    try:
        logger.info(f"Deleting account {id}")
        account = await session.get(Account, id)
        if not account:
            logger.warning(f"Account {id} not found")
            raise HTTPException(404, "Account not found")
        await session.delete(account)
        await session.commit()
        return {"ok": True}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting account {id}: {e}")
        raise HTTPException(500, "Internal server error")
