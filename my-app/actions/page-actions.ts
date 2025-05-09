"use server"

import { type Page, pages } from "@/data/pages"

// Get all pages
export async function getPages(): Promise<Page[]> {
  // In a real app, this would be a database or API call
  return [...pages]
}

// Get a page by ID
export async function getPageById(id: string): Promise<Page | undefined> {
  return pages.find((page) => page.id === id)
}

// Create a new page
export async function createPage(page: Omit<Page, "id">): Promise<Page> {
  const newPage: Page = {
    ...page,
    id: Math.max(...pages.map((p) => Number.parseInt(p.id)), 0) + 1 + "",
  }

  pages.push(newPage)
  return newPage
}

// Update a page
export async function updatePage(id: string, page: Partial<Page>): Promise<Page | undefined> {
  const index = pages.findIndex((p) => p.id === id)
  if (index === -1) return undefined

  pages[index] = { ...pages[index], ...page }
  return pages[index]
}

// Delete a page
export async function deletePage(id: string): Promise<boolean> {
  const index = pages.findIndex((p) => p.id === id)
  if (index === -1) return false

  pages.splice(index, 1)
  return true
}
