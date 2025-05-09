// app/about-me/page.tsx
import { currentUser } from '@/lib/auth.actions';
import React from 'react';

async function AboutMePage() {
  const user = await currentUser();

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">About Me</h1>
      
      {user ? (
        <>
          <div className="mb-6">
            <p className="text-lg">Welcome, <span className="font-semibold">{user.fullname || user.username || 'User'}</span>!</p>
            <p className="text-sm text-gray-600 mt-1">Username: {user.username}</p>
            {user.email && <p className="text-sm text-gray-600">Email: {user.email}</p>}
            {user.title && <p className="text-sm text-gray-600">Title: {user.title}</p>}
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">User Roles</h2>
            {user.roles && user.roles.length > 0 ? (
              <ul className="list-disc pl-5">
                {user.roles.map((role, index) => (
                  <li key={index}>{role}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-600">No roles assigned</p>
            )}
          </div>

          <h2 className="mt-6 text-xl font-semibold">User Details (JSON)</h2>
          <pre className="bg-gray-100 p-4 rounded border overflow-x-auto whitespace-pre-wrap break-all mt-2">
            {JSON.stringify(user, null, 2)}
          </pre>
        </>
      ) : (
        <p className="text-red-500">Not logged in or session expired</p>
      )}

      <p className="mt-4 text-sm text-gray-600">
        <strong>Note:</strong> Displaying detailed user information is for demonstration purposes only.
      </p>
    </div>
  );
}

export default AboutMePage;
