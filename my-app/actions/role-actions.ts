"use server"

import { type Role, roles } from "@/data/roles"
import { users } from "@/data/users"

// Get all roles
export async function getRoles(): Promise<Role[]> {
  return [...roles]
}

// Get a role by ID
export async function getRoleById(id: string): Promise<Role | undefined> {
  return roles.find((role) => role.id === id)
}

// Create a new role
export async function createRole(role: Omit<Role, "id">): Promise<Role> {
  const newRole: Role = {
    ...role,
    id: Math.max(...roles.map((r) => Number.parseInt(r.id)), 0) + 1 + "",
  }

  roles.push(newRole)
  return newRole
}

// Update a role
export async function updateRole(id: string, role: Partial<Role>): Promise<Role | undefined> {
  const index = roles.findIndex((r) => r.id === id)
  if (index === -1) return undefined

  roles[index] = { ...roles[index], ...role }
  return roles[index]
}

// Delete a role
export async function deleteRole(id: string): Promise<boolean> {
  // Check if any users have this role
  const usersWithRole = users.filter((user) => user.roleIds.includes(id))
  if (usersWithRole.length > 0) {
    // In a real app, you might want to handle this differently
    return false
  }

  const index = roles.findIndex((r) => r.id === id)
  if (index === -1) return false

  roles.splice(index, 1)
  return true
}
