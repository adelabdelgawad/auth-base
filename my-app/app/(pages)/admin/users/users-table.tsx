"use client";

import type React from "react";

import {
  createUser,
  deleteUser,
  updateUser
} from "@/actions/user-actions";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import type { User } from "@/data/users";
import { Pencil, PlusCircle, Trash2 } from "lucide-react";
import { useState } from "react";
import { Role } from "@/data/roles";

type usersTableProps = {
  roles: Role[];
  users: User[];
};

export default function UsersTable({roles, users}: usersTableProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState<Partial<User>>({
    roleIds: [],
    disabled: false,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (currentUser.id) {
      // Update existing user
      await updateUser(currentUser.id, currentUser);
    } else {
      // Create new user
      await createUser(currentUser as Omit<User, "id">);
    }

    resetForm();
    setIsSheetOpen(false);
  }

  async function handleDelete(id: string) {
    if (confirm("Are you sure you want to delete this user?")) {
      await deleteUser(id);
    }
  }

  async function toggleUserStatus(user: User) {
    await updateUser(user.id, { disabled: !user.disabled });
  }

  function editUser(user: User) {
    setCurrentUser(user);
    setIsEditing(true);
    setIsSheetOpen(true);
  }

  function addNewUser() {
    setCurrentUser({ roleIds: [], disabled: false });
    setIsEditing(false);
    setIsSheetOpen(true);
  }

  function resetForm() {
    setCurrentUser({ roleIds: [], disabled: false });
    setIsEditing(false);
    setIsSheetOpen(false);
  }

  function handleRoleSelection(roleId: string) {
    const roleIds = currentUser.roleIds || [];
    if (roleIds.includes(roleId)) {
      setCurrentUser({
        ...currentUser,
        roleIds: roleIds.filter((id) => id !== roleId),
      });
    } else {
      setCurrentUser({
        ...currentUser,
        roleIds: [...roleIds, roleId],
      });
    }
  }

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Users</h1>
        <Button onClick={addNewUser} className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          Add New User
        </Button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Users</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Roles
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className={user.disabled ? "bg-gray-50" : ""}>
                  <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.roleIds.map((roleId) => {
                      const role = roles.find((r) => r.id === roleId);
                      return role ? (
                        <span
                          key={roleId}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-1"
                        >
                          {role.name}
                        </span>
                      ) : null;
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Switch
                        checked={!user.disabled}
                        onCheckedChange={() => toggleUserStatus(user)}
                        className="mr-2"
                      />
                      <span
                        className={
                          user.disabled ? "text-red-600" : "text-green-600"
                        }
                      >
                        {user.disabled ? "Disabled" : "Active"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => editUser(user)}
                      className="text-indigo-600 hover:text-indigo-900 mr-2"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{isEditing ? "Edit User" : "Add New User"}</SheetTitle>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={currentUser.name || ""}
                onChange={(e) =>
                  setCurrentUser({ ...currentUser, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={currentUser.email || ""}
                onChange={(e) =>
                  setCurrentUser({ ...currentUser, email: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assigned Roles
              </label>
              <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
                {roles.map((role) => (
                  <div key={role.id} className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id={`role-${role.id}`}
                      checked={(currentUser.roleIds || []).includes(role.id)}
                      onChange={() => handleRoleSelection(role.id)}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                    <label
                      htmlFor={`role-${role.id}`}
                      className="ml-2 text-sm text-gray-700"
                    >
                      {role.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Status
                </label>
                <div className="flex items-center">
                  <Switch
                    id="user-status"
                    checked={!currentUser.disabled}
                    onCheckedChange={(checked) =>
                      setCurrentUser({ ...currentUser, disabled: !checked })
                    }
                    className="mr-2"
                  />
                  <label
                    htmlFor="user-status"
                    className="text-sm text-gray-700"
                  >
                    {currentUser.disabled ? "Disabled" : "Active"}
                  </label>
                </div>
              </div>
            </div>

            <SheetFooter className="pt-4">
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button type="submit">{isEditing ? "Update" : "Create"}</Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
