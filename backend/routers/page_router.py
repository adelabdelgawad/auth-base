from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, and_
from typing import List

from core.dependencies import SessionDep, get_current_user
from core.schema import (
    PageCreate,
    PageRead,
    PageUpdate,
    RolePagePermissionCreate,
    RolePagePermissionRead,
    RolePagePermissionUpdate,
)
from db.models import (
    Account,
    AccountPermission,
    Page,
    Role,
    RolePagePermission,
)

# Create routers
page_router = APIRouter(prefix="/pages", tags=["pages"])
permission_router = APIRouter(prefix="/permissions", tags=["permissions"])


# Page endpoints
@page_router.post("/", response_model=PageRead)
async def create_page(
    page: PageCreate,
    session: SessionDep,
    current_user: Account = Depends(get_current_user),
):
    """Create a new page."""
    db_page = Page(**page.model_dump(), updated_by=current_user.id)
    session.add(db_page)
    await session.commit()
    await session.refresh(db_page)
    return db_page


@page_router.get("/", response_model=List[PageRead])
async def read_pages(
    session: SessionDep,
    skip: int = 0,
    limit: int = 100,
    current_user: Account = Depends(get_current_user),
):
    """Get all pages."""
    statement = select(Page).offset(skip).limit(limit)
    results = await session.execute(statement)
    return results.scalars().all()


@page_router.get("/{page_id}", response_model=PageRead)
async def read_page(
    page_id: int,
    session: SessionDep,
    current_user: Account = Depends(get_current_user),
):
    """Get a specific page by ID."""
    statement = select(Page).where(Page.id == page_id)
    result = await session.execute(statement)
    page = result.scalar_one_or_none()

    if not page:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Page not found"
        )

    return page


@page_router.put("/{page_id}", response_model=PageRead)
async def update_page(
    page_id: int,
    page_update: PageUpdate,
    session: SessionDep,
    current_user: Account = Depends(get_current_user),
):
    """Update a page."""
    statement = select(Page).where(Page.id == page_id)
    result = await session.execute(statement)
    db_page = result.scalar_one_or_none()

    if not db_page:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Page not found"
        )

    # Update page attributes
    for key, value in page_update.model_dump(exclude_unset=True).items():
        setattr(db_page, key, value)

    db_page.updated_by = current_user.id
    await session.commit()
    await session.refresh(db_page)
    return db_page


@page_router.delete("/{page_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_page(
    page_id: int,
    session: SessionDep,
    current_user: Account = Depends(get_current_user),
):
    """Delete a page."""
    statement = select(Page).where(Page.id == page_id)
    result = await session.execute(statement)
    db_page = result.scalar_one_or_none()

    if not db_page:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Page not found"
        )

    # First delete related permissions
    perm_statement = select(RolePagePermission).where(
        RolePagePermission.page_id == page_id
    )
    perm_results = await session.execute(perm_statement)
    permissions = perm_results.scalars().all()

    for permission in permissions:
        await session.delete(permission)

    # Then delete the page
    await session.delete(db_page)
    await session.commit()

    return None


# Permission endpoints
@permission_router.post("/role-page", response_model=RolePagePermissionRead)
async def create_role_page_permission(
    permission: RolePagePermissionCreate,
    session: SessionDep,
    current_user: Account = Depends(get_current_user),
):
    """Assign a page permission to a role."""
    # Check if permission already exists
    statement = select(RolePagePermission).where(
        and_(
            RolePagePermission.role_id == permission.role_id,
            RolePagePermission.page_id == permission.page_id,
        )
    )
    result = await session.execute(statement)
    existing = result.scalar_one_or_none()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Permission already exists for this role and page",
        )

    db_permission = RolePagePermission(
        **permission.model_dump(), updated_by=current_user.id
    )
    session.add(db_permission)
    await session.commit()
    await session.refresh(db_permission)
    return db_permission


@permission_router.get(
    "/role/{role_id}", response_model=List[RolePagePermissionRead]
)
async def read_role_permissions(
    role_id: int,
    session: SessionDep,
    current_user: Account = Depends(get_current_user),
):
    """Get all page permissions for a specific role."""
    statement = select(RolePagePermission).where(
        RolePagePermission.role_id == role_id
    )
    results = await session.execute(statement)
    return results.scalars().all()


@permission_router.get(
    "/page/{page_id}", response_model=List[RolePagePermissionRead]
)
async def read_page_permissions(
    page_id: int,
    session: SessionDep,
    current_user: Account = Depends(get_current_user),
):
    """Get all role permissions for a specific page."""
    statement = select(RolePagePermission).where(
        RolePagePermission.page_id == page_id
    )
    results = await session.execute(statement)
    return results.scalars().all()


@permission_router.put(
    "/role-page/{permission_id}", response_model=RolePagePermissionRead
)
async def update_role_page_permission(
    permission_id: int,
    permission_update: RolePagePermissionUpdate,
    session: SessionDep,
    current_user: Account = Depends(get_current_user),
):
    """Update a role-page permission."""
    statement = select(RolePagePermission).where(
        RolePagePermission.id == permission_id
    )
    result = await session.execute(statement)
    db_permission = result.scalar_one_or_none()

    if not db_permission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Permission not found",
        )

    # Update permission attributes
    for key, value in permission_update.model_dump(exclude_unset=True).items():
        setattr(db_permission, key, value)

    db_permission.updated_by = current_user.id
    await session.commit()
    await session.refresh(db_permission)
    return db_permission


@permission_router.delete(
    "/role-page/{permission_id}", status_code=status.HTTP_204_NO_CONTENT
)
async def delete_role_page_permission(
    permission_id: int,
    session: SessionDep,
    current_user: Account = Depends(get_current_user),
):
    """Delete a role-page permission."""
    statement = select(RolePagePermission).where(
        RolePagePermission.id == permission_id
    )
    result = await session.execute(statement)
    db_permission = result.scalar_one_or_none()

    if not db_permission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Permission not found",
        )

    await session.delete(db_permission)
    await session.commit()

    return None


# Add a helper endpoint to get user accessible pages
@permission_router.get("/my-pages", response_model=List[PageRead])
async def read_my_accessible_pages(
    session: SessionDep, current_user: Account = Depends(get_current_user)
):
    """Get all pages accessible to the current user based on their roles."""
    # Get user's roles
    role_statement = (
        select(Role.id)
        .join(AccountPermission, AccountPermission.role_id == Role.id)
        .where(AccountPermission.account_id == current_user.id)
    )

    role_results = await session.execute(role_statement)
    role_ids = role_results.scalars().all()

    # If user has no roles, return empty list
    if not role_ids:
        return []

    # Get pages accessible to user's roles
    page_statement = (
        select(Page)
        .join(RolePagePermission, RolePagePermission.page_id == Page.id)
        .where(
            and_(
                RolePagePermission.role_id.in_(role_ids),
                RolePagePermission.can_view == True,
            )
        )
        .distinct()
    )

    page_results = await session.execute(page_statement)
    return page_results.scalars().all()
