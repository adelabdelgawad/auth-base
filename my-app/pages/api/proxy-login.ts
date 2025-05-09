// pages/api/proxy-login.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { username, password } = req.body;

  // Call your FastAPI backend
  const backendRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!backendRes.ok) {
    // Return backend error detail to client
    let detail = "Login failed";
    try {
      const data = await backendRes.json();
      detail = data.detail || detail;
    } catch {
      detail = await backendRes.text();
    }
    return res.status(401).json({ error: detail });
  }

  // If login succeeds, call NextAuth's signIn (server-side)
  // This is a bit tricky: you may need to use NextAuth's internal API or set a session cookie manually.
  // For demo, just return success and tokens to client:
  const tokens = await backendRes.json();
  // Optionally, you could set a cookie or trigger NextAuth sign-in logic here.
  return res.status(200).json({ success: true, tokens });
}
