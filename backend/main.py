import logging
from fastapi import FastAPI
from contextlib import asynccontextmanager

# Import your routers
from routers.auth import router as auth_router
from routers.branch_router import router as branch_router
from routers.unit_router import router as unit_router
from routers.unit_profile_router import router as unit_profile_router
from routers.branch_unit_router import router as branch_unit_router
from routers.voucher_status_router import router as voucher_status_router
from routers.login_log_router import router as login_log_router
from routers.account_router import router as account_router
from routers.role_router import router as role_router
from routers.audit_log_router import router as audit_log_router
from routers.audit_log_detail_router import router as audit_log_detail_router
from db.setup_database import setup_database

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: setup the database before the application starts
    logging.info("Starting up the application and setting up the database")
    await setup_database()

    yield  # This is where the application runs

    # Shutdown: cleanup operations when the application is shutting down
    logging.info("Shutting down the application")
    # Add any cleanup code here if needed


# Create the FastAPI app with the lifespan
app = FastAPI(
    title="Mabara Voucher API",
    description="API for managing branches, units, vouchers, accounts, and more.",
    version="1.0.0",
    lifespan=lifespan,
)

# Include routers
app.include_router(auth_router)
app.include_router(branch_router)
app.include_router(unit_router)
app.include_router(unit_profile_router)
app.include_router(branch_unit_router)
app.include_router(voucher_status_router)
app.include_router(login_log_router)
app.include_router(account_router)
app.include_router(role_router)
app.include_router(audit_log_router)
app.include_router(audit_log_detail_router)
