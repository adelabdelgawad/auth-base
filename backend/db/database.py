import os
import logging
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

from config import settings

# Load environment variables
load_dotenv()

# Logger setup
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


DATABASE_URL = f"mysql+aiomysql://{settings.DB_USER}:{settings.DB_PASSWORD}@{settings.DB_SERVER}/{settings.DB_NAME}?charset=utf8mb4"

# Create the async engine and session factory once (module-level, for reuse)
engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(
    bind=engine, class_=AsyncSession, expire_on_commit=False
)


async def get_application_session():
    """
    Provides an application-level async database session.
    Usage: async with get_application_session() as session:
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await engine.dispose()
            # Close the session after use
            await session.close()
