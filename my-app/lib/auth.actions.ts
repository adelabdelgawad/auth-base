// lib/currentUser.ts
"use server";

import { auth } from "@/auth";
import { AppUser } from "@/types/auth";
import { jwtDecode } from "jwt-decode";
import { redirect } from "next/navigation";

/**
 * Fetches the current session via Auth.js, decodes the user payload,
 * and redirects to login if no valid session exists.
 *
 * @param options Configuration options
 * @param options.redirectToLogin Whether to redirect to login page if no session (default: true)
 * @returns The `AppUser` from the JWT, or `null` if no valid session exists and redirectToLogin is false
 */
export async function currentUser(options: { redirectToLogin?: boolean } = {}): Promise<AppUser | null> {
  const { redirectToLogin = true } = options;
  
  try {
    // 1) Load the session (server-side only)
    const session = await auth();
    
    if (!session?.accessToken) {
      // No access token → not signed in
      if (redirectToLogin) {
        redirect("/login");
      }
      return null;
    }

    // 2) Decode the JWT payload - updated to match actual token structure
    const decoded = jwtDecode<{ account: AppUser }>(session.accessToken);
    
    // Extract the account property which contains user data
    const user = decoded.account;
    return user;
  } catch (err) {
    // 3) Something went wrong (network, bad token, etc.)
    console.error("currentUser(): failed to decode or fetch session", err);
    
    if (redirectToLogin) {
      redirect("/login");
    }
    return null;
  }
}
