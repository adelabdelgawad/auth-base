"use client";
import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react"; // Use the client-side NextAuth API

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Step 1: Call proxy API to check credentials and get backend error
      const res = await fetch("/api/proxy-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      // Step 2: If success, trigger NextAuth signIn to set up session/tokens
      const authRes = await signIn("credentials", {
        redirect: false,
        username,
        password,
      });

      if (!authRes || authRes.error) {
        setError("Unexpected authentication error.");
        setLoading(false);
        return;
      }

      router.push("/");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white rounded-lg shadow-md p-6 space-y-4"
      >
        <h1 className="text-2xl font-semibold text-center">Sign In</h1>

        {error && <p className="text-sm text-red-600 text-center">{error}</p>}

        <div>
          <label htmlFor="username" className="block text-sm font-medium">
            Username
          </label>
          <input
            id="username"
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {isLoading ? "Signing In…" : "Sign In"}
        </button>
      </form>
    </div>
  );
}
