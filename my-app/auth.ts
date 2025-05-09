import { signInSchema } from "@/lib/zod";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { AppJWT, AppUser, AuthorizeUser, BackendToken } from "./types/auth";

const ACCESS_EXP_SEC = parseInt(process.env.ACCESS_TOKEN_EXPIRY!, 10) || 3600;
const REFRESH_EXP_SEC =
  parseInt(process.env.REFRESH_TOKEN_EXPIRY!, 10) || 604800;

async function signInToFastAPI(
  username: string,
  password: string
): Promise<BackendToken | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      console.error(`Login failed with status: ${res.status}`);
      const errorText = await res.text();
      console.error(`Error details: ${errorText}`);
      return null;
      
    }

    const data = await res.json();
    console.log("Login successful, received tokens");
    return data;
    
  } catch (error) {
    console.error("Error during login:", error);
    return null;
  }
}
// Small changes to your auth.ts refreshAccessToken function to ensure it's calling the right endpoint

async function refreshAccessToken(token: AppJWT): Promise<AppJWT> {
  console.log("Attempting to refresh token");

  if (!token.refreshToken) {
    console.error("No refresh token available");
    return { ...token, error: "NoRefreshToken" };
  }

  try {
    // Make sure this URL matches your backend endpoint (should be /refresh not /refresh-token)
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: token.refreshToken }),
    });

    if (!res.ok) {
      console.error(`Refresh failed with status: ${res.status}`);
      const errorText = await res.text();
      console.error(`Error details: ${errorText}`);
      return {
        ...token,
        error: "RefreshFailed",
        accessToken: "",
        refreshToken: "",
      };
    }

    const data = await res.json();
    console.log("Token refreshed successfully");

    // compute new expiries in ms
    const now = Date.now();
    const newToken = {
      ...token,
      accessToken: data.access_token,
      refreshToken: data.refresh_token, // Make sure backend returns this
      accessTokenExpires: now + ACCESS_EXP_SEC * 1_000,
      refreshTokenExpires: now + REFRESH_EXP_SEC * 1_000,
      error: undefined, // Clear any previous errors
    };

    return newToken;
  } catch (error) {
    console.error("Error refreshing token:", error);
    return {
      ...token,
      error: `RefreshError: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: { username: {}, password: {} },
      // In auth.ts - update the authorize function
      async authorize(credentials) {
        try {
          // validate shape
          const parsed = await signInSchema.safeParseAsync(credentials);
          if (!parsed.success) {
            console.error("Invalid credentials format:", parsed.error);
            return null;
          }
          const { username, password } = parsed.data;

          // get raw tokens
          const backend = await signInToFastAPI(username, password);
          if (!backend) {
            console.error("Failed to get tokens from backend");
            return null;
          }

          try {
            // decode user
            const [, payload] = backend.accessToken.split(".");
            const user = JSON.parse(Buffer.from(payload, "base64").toString())
              .user as AppUser;
            
            const now = Date.now();
            return {
              id: "1",
              accessToken: backend.accessToken,
              refreshToken: backend.refreshToken,
              accessTokenExpires: now + ACCESS_EXP_SEC * 1_000,
              refreshTokenExpires: now + REFRESH_EXP_SEC * 1_000,
              user,
            };
          } catch (decodeError) {
            console.error("Failed to decode JWT:", decodeError);
            return null;
          }
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: parseInt(process.env.SESSION_MAX_AGE!, 10),
  },

  callbacks: {
    async jwt({ token, user }) {
      // initial sign-in
      if (user) {
        const u = user as AuthorizeUser;
        return { ...u };
      }

      // still valid?
      if (Date.now() < (token as AppJWT).accessTokenExpires) {
        return token;
      }

      // access token expired → rotate
      return refreshAccessToken(token as AppJWT);
    },

    async session({ session, token }) {
      const t = token as AppJWT;
      return {
        ...session,
        accessToken: t.accessToken,
        expires: new Date(t.accessTokenExpires).toISOString(),
      };
    },
  },

  pages: { signIn: "/login" },
  debug: process.env.NODE_ENV === "development",
});
