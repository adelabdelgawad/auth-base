# setup_database.py

"""
An async-compatible database setup and seed script for a SQLModel project.

Handles:
1. Loading configuration from environment variables.
2. Creating the database if it doesn't exist (synchronous).
3. Creating tables based on SQLModel models if they don't exist (synchronous).
4. Seeding the database with default values (asynchronous).
"""

import asyncio
import logging
import sys

from sqlalchemy import create_engine, text, Engine
from sqlalchemy.exc import OperationalError, ProgrammingError
from sqlalchemy.ext.asyncio import (
    create_async_engine,
    AsyncEngine,
    AsyncSession,
)
from sqlmodel import SQLModel, select

# Assuming these models are correctly defined in db.models
# Make sure AppModel is a common base or registry for your SQLModels
from config import settings
from db.models import Role, Account
from core.password_hash import hash_password  # Ensure this service exists

# ------------------------------------------------------------------------------
# Configuration Loading
# ------------------------------------------------------------------------------


# ------------------------------------------------------------------------------
# Logging Setup
# ------------------------------------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

# ------------------------------------------------------------------------------
# Database URLs and Engines
# ------------------------------------------------------------------------------
# URL for connecting *without* specifying a database (for initial creation check)
BASE_SYNC_URL = f"mysql+pymysql://{settings.DB_USER}:{settings.DB_PASSWORD}@{settings.DB_SERVER}"
# URL for synchronous operations *on the specific database* (table creation)
SYNC_DB_URL = f"{BASE_SYNC_URL}/{settings.DB_NAME}?charset=utf8mb4"
# URL for asynchronous operations (seeding)
ASYNC_DB_URL = f"mysql+aiomysql://{settings.DB_USER}:{settings.DB_PASSWORD}@{settings.DB_SERVER}/{settings.DB_NAME}?charset=utf8mb4"

# Create engines (deferring connection until needed)
# Use future=True for compatibility with modern SQLAlchemy/SQLModel features
sync_engine: Engine = create_engine(SYNC_DB_URL, echo=False, future=True)
async_engine: AsyncEngine = create_async_engine(
    ASYNC_DB_URL, echo=False, future=True
)


# ------------------------------------------------------------------------------
# 1. Create Database If Not Exists (Synchronous)
# ------------------------------------------------------------------------------


def create_database_if_not_exists() -> None:
    """Creates the database if it does not already exist using a temporary base connection."""
    logger.info(f"Checking if database '{settings.DB_NAME}' exists...")
    # Use a temporary engine connected to the server, not a specific DB
    base_engine = create_engine(BASE_SYNC_URL, echo=False, future=True)
    try:
        with base_engine.connect() as connection:
            # Check if database exists
            result = connection.execute(
                text(
                    "SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA "
                    f"WHERE SCHEMA_NAME = :db_name"
                ),
                {"db_name": settings.DB_NAME},
            )
            exists = result.scalar()

            if not exists:
                # Create database with specific character set and collation
                # Using text() for transactional safety if supported by DB/driver
                connection.execute(
                    text(
                        f"CREATE DATABASE `{settings.DB_NAME}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
                    )
                )
                # Important: Commit the transaction for DDL statements like CREATE DATABASE
                connection.commit()
                logger.info(
                    f"Database '{settings.DB_NAME}' created successfully."
                )
            else:
                logger.info(f"Database '{settings.DB_NAME}' already exists.")
    except OperationalError as e:
        logger.error(
            f"Error connecting to the database server at {settings.DB_SERVER}: {e}"
        )
        logger.error(
            "Please check DB_USER, DB_PASSWORD, and DB_SERVER environment variables and ensure the server is running."
        )
        sys.exit(1)
    except ProgrammingError as e:
        # Catch errors like access denied for creating database
        logger.error(f"Database error during creation check: {e}")
        logger.error(
            f"Ensure account '{settings.DB_USER}' has privileges to check and create databases."
        )
        sys.exit(1)
    except Exception as e:
        # Catch any other unexpected errors
        logger.error(
            f"An unexpected error occurred during database creation check: {e}"
        )
        sys.exit(1)
    finally:
        # Dispose the temporary engine
        base_engine.dispose()


# ------------------------------------------------------------------------------
# 2. Create Tables If Not Exists (Synchronous)
# ------------------------------------------------------------------------------


def create_tables(engine: Engine) -> None:
    """
    Creates all tables defined in SQLModel metadata if they don't exist.
    Uses a synchronous engine connected to the specific database.
    """
    logger.info("Attempting to create tables...")
    try:
        # SQLModel.metadata.create_all is synchronous
        SQLModel.metadata.create_all(engine)
        logger.info("Tables checked/created successfully.")
    except OperationalError as e:
        logger.error(
            f"Error connecting to database '{settings.DB_NAME}' for table creation: {e}"
        )
        logger.error(
            "Ensure the database exists and connection details are correct."
        )
        sys.exit(1)
    except Exception as e:
        logger.error(
            f"An unexpected error occurred during table creation: {e}"
        )
        sys.exit(1)


# ------------------------------------------------------------------------------
# 3. Seed Default Values (Asynchronous)
# ------------------------------------------------------------------------------


async def seed_roles(session: AsyncSession) -> None:
    """Seeds default role data if none exists."""
    try:
        result = await session.execute(select(Role).limit(1))
        if result.first():
            logger.info("Roles already exist, skipping seeding.")
            return

        logger.info("Seeding default roles...")
        roles = [
            Role(
                name="Admin",
                description="Has full access to the system",
                en_name="Admin",
                en_description="Has full access to the system",
                ar_name="المسؤول",
                ar_description="يمتلك كافة صلاحيات النظام",
            ),
            Role(
                name="Account",
                description="Can access basic features",
                en_name="Account",
                en_description="Can access basic features",
                ar_name="المستخدم",
                ar_description="يمكنه الوصول إلى الميزات الأساسية",
            ),
        ]
        session.add_all(roles)
        await session.commit()
        logger.info("Default roles added.")
    except Exception as e:
        logger.error(f"Error seeding roles: {e}")
        await session.rollback()


async def seed_admin_account(session: AsyncSession) -> None:
    result = await session.execute(
        select(Account).where(Account.username == "admin")
    )
    admin = result.scalar_one_or_none()
    hashed_password = hash_password(settings.DEFAULT_ADMIN_PASSWORD)
    if admin:
        logger.info("Admin account exists")
    else:
        # Create admin account if not exists
        admin_account = Account(
            username="admin",
            password=hashed_password,
            fullname="Administrator",
            title="Built-in Administrator",
            is_super_admin=True,
        )
        session.add(admin_account)
        logger.info("Default admin account added.")
    await session.commit()


# ------------------------------------------------------------------------------
# Main Orchestration Function
# ------------------------------------------------------------------------------


async def setup_database() -> None:
    """
    Orchestrates the database setup process:
    - Create database (synchronous)
    - Create tables (synchronous)
    - Seed default values (asynchronous)
    """
    # Synchronous Steps
    create_database_if_not_exists()
    create_tables(sync_engine)  # Use the engine connected to the specific DB

    # Asynchronous Seeding
    logger.info("Starting data seeding...")
    async with AsyncSession(async_engine) as session:
        try:
            await seed_roles(session)
            await seed_admin_account(session)
            # Add calls to other seeding functions here if needed
            logger.info("Data seeding process completed.")
        except Exception as e:
            # Catch any error during the session block
            logger.error(f"An error occurred during the seeding session: {e}")
            await session.rollback()  # Ensure rollback on any failure within the block
            sys.exit(1)  # Exit if seeding fails critically
        finally:
            await async_engine.dispose()


# ------------------------------------------------------------------------------
# Script Entry Point
# ------------------------------------------------------------------------------

if __name__ == "__main__":
    logger.info("Starting database setup script...")
    try:
        # Run the main async setup function
        asyncio.run(setup_database())
        logger.info("Database setup and seeding completed successfully.")
    except Exception as e:
        # Catch errors from setup_database OR asyncio.run itself
        logger.exception(
            f"An critical error occurred during script execution: {e}"
        )
        sys.exit(1)  # Exit on critical failure
    finally:
        # --- Dispose ONLY the synchronous engine here ---
        if sync_engine:
            logger.info("Disposing sync database engine...")
            sync_engine.dispose()
            logger.info("Sync engine disposed.")
        logger.info("Script finished.")  # Indicate script completion
