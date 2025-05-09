// types/next-auth.d.ts

// 1. Extend JWT payload (output of `jwt` callback, stored in cookie)
import "next-auth/jwt";

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and stored in the cookie */
  interface JWT {
    /** The raw FastAPI access token */
    accessToken: string;
    // 'sub' (string) and 'exp' (number, seconds) are already standard JWT claims
    // Add other custom claims persisted IN the JWT cookie if needed
    // customClaim?: string;
  }
}

// 2. Extend Session object (output of `session` callback, used in application)
import "next-auth";

declare module "next-auth" {
  /**
   * Represents the session object returned by `useSession`, `getSession`, `auth`.
   * This should match the object structure returned by your `session` callback.
   */
  interface Session {
    /** The JWT "subject" (your username/ID) */
    sub: string;
    /** The raw FastAPI JWT */
    accessToken: string;
    /** Session expiry derived from JWT 'exp', as ISO timestamp string */
    expires: string;

    // If you decided to keep a nested user object (Option B in session callback)
    // user?: {
    //   id?: string;
    //   // other user props like name, email if you add them to JWT/session
    // } & DefaultSession["user"]; // Extend default user type if needed
  }


}