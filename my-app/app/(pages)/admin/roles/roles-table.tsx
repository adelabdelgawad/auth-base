"use client";

import type React from "react";

import {
  createRole,
  deleteRole,
  updateRole
} from "@/actions/role-actions";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Page } from "@/data/pages";
import type { Role } from "@/data/roles";
import { Pencil, PlusCircle, Trash2 } from "lucide-react";
import { useState } from "react";

type rolesTableProps = {
  pages: Page[];
  roles: Role[];
};
export default function RolesTable({ pages, roles }: rolesTableProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentRole, setCurrentRole] = useState<Partial<Role>>({
    pageIds: [],
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (currentRole.id) {
      // Update existing role
      await updateRole(currentRole.id, currentRole);
    } else {
      // Create new role
      await createRole(currentRole as Omit<Role, "id">);
    }

    resetForm();
    setIsSheetOpen(false);
  }

  async function handleDelete(id: string) {
    if (confirm("Are you sure you want to delete this role?")) {
      const success = await deleteRole(id);
      if (!success) {
        alert("Cannot delete this role because it is assigned to users.");
        return;
      }
    }
  }

  function editRole(role: Role) {
    setCurrentRole(role);
    setIsEditing(true);
    setIsSheetOpen(true);
  }

  function addNewRole() {
    setCurrentRole({ pageIds: [] });
    setIsEditing(false);
    setIsSheetOpen(true);
  }

  function resetForm() {
    setCurrentRole({ pageIds: [] });
    setIsEditing(false);
    setIsSheetOpen(false);
  }

  function handlePageSelection(pageId: string) {
    const pageIds = currentRole.pageIds || [];
    if (pageIds.includes(pageId)) {
      setCurrentRole({
        ...currentRole,
        pageIds: pageIds.filter((id) => id !== pageId),
      });
    } else {
      setCurrentRole({
        ...currentRole,
        pageIds: [...pageIds, pageId],
      });
    }
  }

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Roles</h1>
        <Button onClick={addNewRole} className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          Add New Role
        </Button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Roles</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pages
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {roles.map((role) => (
                <tr key={role.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{role.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {role.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {role.pageIds.length} pages
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => editRole(role)}
                      className="text-indigo-600 hover:text-indigo-900 mr-2"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(role.id)}
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
            <SheetTitle>{isEditing ? "Edit Role" : "Add New Role"}</SheetTitle>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={currentRole.name || ""}
                onChange={(e) =>
                  setCurrentRole({ ...currentRole, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={currentRole.description || ""}
                onChange={(e) =>
                  setCurrentRole({
                    ...currentRole,
                    description: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assigned Pages
              </label>
              <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-md p-2">
                {pages.map((page) => (
                  <div key={page.id} className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id={`page-${page.id}`}
                      checked={(currentRole.pageIds || []).includes(page.id)}
                      onChange={() => handlePageSelection(page.id)}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                    <label
                      htmlFor={`page-${page.id}`}
                      className="ml-2 text-sm text-gray-700"
                    >
                      {page.title} ({page.path})
                    </label>
                  </div>
                ))}
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
