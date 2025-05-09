"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-black rounded-md"
    >
      Sign Out
    </button>
  );
}
