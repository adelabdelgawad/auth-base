// pages/api/profile.ts
import { auth } from "@/auth"; // Adjust the path if your auth.ts is located elsewhere
import axiosInstance from "@/lib/axiosInstance";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end("Method Not Allowed");
  }
  // 2️⃣ Get the session using the server-side auth() helper
  const session = await auth();
  const token = session?.accessToken;
  try {
    // Set or remove the Authorization header based on token availability
    if (token) {
      axiosInstance.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${token}`;
    } else {
      delete axiosInstance.defaults.headers.common["Authorization"];
    }
    const response = await axiosInstance.post("/identity");
    return response.data;
  } catch (error: unknown) {
    console.error("Error updating user roles:", error);
    throw new Error("Failed to update user roles");
  }
}
