"use server"

import { type Page, pages } from "@/data/pages"
import type { Role } from "@/data/roles"
import { getUserById } from "./user-actions"
import { getRoleById } from "./role-actions"

// Get all pages accessible to a user
export async function getUserAccessiblePages(userId: string): Promise<Page[]> {
  const user = await getUserById(userId)
  if (!user || user.disabled) return []

  // Get all roles for the user
  const userRoles: Role[] = []
  for (const roleId of user.roleIds) {
    const role = await getRoleById(roleId)
    if (role) userRoles.push(role)
  }

  // Get all page IDs the user has access to
  const accessiblePageIds = new Set<string>()
  userRoles.forEach((role) => {
    role.pageIds.forEach((pageId) => {
      accessiblePageIds.add(pageId)
    })
  })

  // Return all pages the user has access to
  return pages.filter((page) => accessiblePageIds.has(page.id)).sort((a, b) => a.order - b.order)
}

// Check if a user has access to a specific page
export async function userHasAccess(userId: string, pagePath: string): Promise<boolean> {
  const accessiblePages = await getUserAccessiblePages(userId)
  return accessiblePages.some((page) => page.path === pagePath)
}
