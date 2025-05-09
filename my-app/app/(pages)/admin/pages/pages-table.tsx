"use client"

import * as React from "react"
import { useState } from "react"
import type { Page } from "@/data/pages"
import { getPages, createPage, updatePage, deletePage } from "@/actions/page-actions"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { PlusCircle, Pencil, Trash2 } from "lucide-react"
import * as LucideIcons from "lucide-react"

function getIcon(name?: string) {
  if (!name) return null
  const pascal = name.split("-").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join("")
  const Icon = (LucideIcons as any)[pascal]
  return typeof Icon === "function" ? Icon : null
}

export default function PagesTable({ pages: initialPages }: { pages: Page[] }) {
  const [pages, setPages] = useState<Page[]>(initialPages)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentPage, setCurrentPage] = useState<Partial<Page>>({})

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (currentPage.id) {
      await updatePage(currentPage.id, currentPage)
    } else {
      await createPage(currentPage as Omit<Page, "id">)
    }
    resetForm()
    setPages(await getPages())
    setIsSheetOpen(false)
  }

  async function handleDelete(id: string) {
    if (confirm("Are you sure you want to delete this page?")) {
      await deletePage(id)
      setPages(await getPages())
    }
  }

  function editPage(page: Page) {
    setCurrentPage(page)
    setIsEditing(true)
    setIsSheetOpen(true)
  }

  function addNewPage() {
    setCurrentPage({})
    setIsEditing(false)
    setIsSheetOpen(true)
  }

  function resetForm() {
    setCurrentPage({})
    setIsEditing(false)
    setIsSheetOpen(false)
  }

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Pages</h1>
        <Button onClick={addNewPage} className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          Add New Page
        </Button>
      </div>

      <div className="bg-neutral-900 shadow rounded-lg overflow-hidden">
        <div className="p-4 border-b border-neutral-800">
          <h2 className="text-lg font-semibold text-white">Pages</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-800">
            <thead className="bg-neutral-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Icon
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Path
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-neutral-900 divide-y divide-neutral-800">
              {pages.map((page) => {
                const Icon = getIcon(page.icon)
                return (
                  <tr key={page.id} className="hover:bg-neutral-800 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {Icon ? <Icon className="h-5 w-5 text-neutral-300" /> : <span className="text-neutral-500">-</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-white font-medium">{page.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-neutral-300">{page.path}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-neutral-400">{page.description || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editPage(page)}
                        className="text-indigo-400 hover:text-indigo-200 mr-2"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(page.id)}
                        className="text-red-400 hover:text-red-200"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{isEditing ? "Edit Page" : "Add New Page"}</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-200">Title</label>
              <input
                type="text"
                value={currentPage.title || ""}
                onChange={(e) => setCurrentPage({ ...currentPage, title: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-700 bg-neutral-900 text-white rounded-md"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-200">Path</label>
              <input
                type="text"
                value={currentPage.path || ""}
                onChange={(e) => setCurrentPage({ ...currentPage, path: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-700 bg-neutral-900 text-white rounded-md"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-200">Description</label>
              <input
                type="text"
                value={currentPage.description || ""}
                onChange={(e) => setCurrentPage({ ...currentPage, description: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-700 bg-neutral-900 text-white rounded-md"
                placeholder="Optional"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-200">Icon (Lucide icon name)</label>
              <input
                type="text"
                value={currentPage.icon || ""}
                onChange={(e) => setCurrentPage({ ...currentPage, icon: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-700 bg-neutral-900 text-white rounded-md"
                placeholder="e.g., home, settings, user"
              />
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
  )
}
