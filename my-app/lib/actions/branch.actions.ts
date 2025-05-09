// lib/branchActions.ts
import { Branch } from "@/types";
import axiosInstance from "../axiosInstance";

// Fetch all branches
export async function getBranches(): Promise<Branch[]> {
  //usage
  // const branches = await getBranches();
  const response = await axiosInstance.get<Branch[]>("/branches/");
  return response.data;
}
// Create a new branch
export async function createBranch(
  branch: Omit<Branch, "id" | "created_at" | "updated_at">
): Promise<Branch> {
  //usage
  // const newBranch = await createBranch({ name: 'New Branch', location: 'Location' });
  const response = await axiosInstance.post<Branch>("/branches/", branch);
  return response.data;
}

// Update an existing branch
export async function updateBranch(
  id: number,
  branch: Partial<Omit<Branch, "id" | "created_at" | "updated_at">>
): Promise<Branch> {
  //usage
  // const updatedBranch = await updateBranch(1, { name: 'Updated Branch' });
  const response = await axiosInstance.put<Branch>(`/branches/${id}`, branch);
  return response.data;
}

// Delete a branch
export async function deleteBranch(id: number): Promise<{ ok: boolean }> {
  //usage
  // const deleteResponse = await deleteBranch(1);
  const response = await axiosInstance.delete<{ ok: boolean }>(
    `/branches/${id}`
  );
  return response.data;
}
