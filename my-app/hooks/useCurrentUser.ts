// hooks/useCurrentUser.ts
"use client";

import { JWTWithUser } from "@/types/auth";
import { jwtDecode } from "jwt-decode";
import { useSession } from "next-auth/react";

/**
 * A simplified AppUser type for your React code.
 */
export type AppUser = JWTWithUser["user"];

/**
 * A small wrapper around `useSession()` that:
 *  1. Exposes `user` as a fully typed `AppUser|null`
 *  2. Provides `isLoading` and `error` flags
 */
export function useCurrentUser(): {
  user: AppUser | null;
  isLoading: boolean;
  error: Error | null;
} {
  const { data: session, status, update } = useSession();
  const isLoading = status === "loading";
  const error =
    status === "unauthenticated" ? new Error("Not signed in") : null;

  let user: AppUser | null = null;
  if (session?.accessToken) {
    try {
      // Decode the JWT’s payload; we know it has a `user` field
      const decoded = jwtDecode<JWTWithUser>(session.accessToken);
      user = decoded.user;
    } catch (e) {
      console.error("Failed to decode session.accessToken", e);
    }
  }

  return { user, isLoading, error };
}
