import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncEngine
from sqlalchemy import create_engine, text
from sqlmodel import SQLModel
from dotenv import load_dotenv

load_dotenv()
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_SERVER = os.getenv("DB_SERVER")
DB_NAME = os.getenv("DB_NAME")
ASYNC_DATABASE_URL = f"mysql+aiomysql://{DB_USER}:{DB_PASSWORD}@{DB_SERVER}/{DB_NAME}?charset=utf8mb4"
BASE_SYNC_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_SERVER}"


async def drop_tables(engine: AsyncEngine):
    print("Dropping all tables...")
    try:
        async with engine.begin() as conn:
            await conn.run_sync(SQLModel.metadata.drop_all)
        print("All tables dropped.")
    except Exception as e:
        print(f"Error dropping tables: {e}")


def drop_database():
    print(f"Dropping database '{DB_NAME}'...")
    try:
        engine = create_engine(BASE_SYNC_URL, echo=False, future=True)
        with engine.connect() as conn:
            conn.execute(text(f"DROP DATABASE IF EXISTS {DB_NAME}"))
        print(f"Database '{DB_NAME}' deleted.")
    except Exception as e:
        print(f"Error deleting database: {e}")


async def main(delete_db: bool = False):
    engine = create_async_engine(ASYNC_DATABASE_URL, echo=False, future=True)
    await drop_tables(engine)
    await engine.dispose()
    if delete_db:
        drop_database()


if __name__ == "__main__":
    print("Starting database cleanup...")
    delete_db = (
        input("Delete the entire database? (yes/no): ").strip().lower()
        == "yes"
    )
    asyncio.run(main(delete_db))
    print("Cleanup complete.")
