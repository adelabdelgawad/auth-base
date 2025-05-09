"use server";
import axiosInstance from "@/lib/axiosInstance";
import { DomainUser, Role, SettingUsersResponse, UserCreate } from "@/types/user";

// 2. Fetch domain users (returns the users examples)
export async function getUsers(
  limit: number,
  query: string,
  skip: number
): Promise<SettingUsersResponse | undefined> {
  try {
    const response = await axiosInstance.get(
      `/setting/users/?skip=${skip}&limit=${limit}&query=${encodeURIComponent(
        query
      )}`
    );
    // Ensure roles are correctly parsed
    return response.data;
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return undefined;
  }
}

export async function getDomainUsers(): Promise<DomainUser[] | undefined> {
  try {
    const response = await axiosInstance.get("/setting/domain-users");

    // Ensure roles are correctly parsed
    return response.data;
  } catch (error) {
    console.error("Failed to fetch Domain users:", error);
    return undefined;
  }
}

export async function getRoles(): Promise<Role[] | undefined> {
  try {
    const response = await axiosInstance.get("/setting/role");
    // Ensure roles are correctly parsed
    return response.data;
  } catch (error) {
    console.error("Failed to fetch Roles:", error);
    return undefined;
  }
}

export async function createUser(userData: UserCreate) {
  try {
    const response = await axiosInstance.post("/setting/user", userData);
    return response.data;
  } catch (error: unknown) {
    console.error("Error updating user roles:", error);
    throw new Error("Failed to update user roles");
  }
}

/**
 * Updates the user roles and active status on the server.
 *
 * @param userData - The user update parameters.
 * @returns The response data from the server.
 */
export async function updateUserRoles(
  userData: UpdateUserParams
): Promise<void> {
  try {
    // Send the update request with the userData payload
    const response = await axiosInstance.put(
      `/setting/user/${userData.userId}`,
      userData
    );
    return response.data;
  } catch (error: unknown) {
    console.error("Error updating user roles:", error);
    throw new Error("Failed to update user roles");
  }
}

/**
 * Parameters for updating a user's roles and active status.
 */
type UpdateUserParams = {
  /** The user's ID. */
  userId: number;
  /** The current active status of the user. */
  active: boolean;
  /**
   * Indicates whether the active status has been changed from its original value.
   * This helps determine if the change is intentional and requires processing.
   */
  activeChanged: boolean;
  /** An array of role IDs to be added to the user. */
  addedRoles: number[];
  /** An array of role IDs to be removed from the user. */
  removedRoles: number[];
};