export default function Dashboard() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-2">Users</h2>
          <p className="text-3xl font-bold">5</p>
          <p className="text-sm text-gray-500 mt-1">Total users in the system</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-2">Roles</h2>
          <p className="text-3xl font-bold">4</p>
          <p className="text-sm text-gray-500 mt-1">Total roles defined</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-2">Pages</h2>
          <p className="text-3xl font-bold">9</p>
          <p className="text-sm text-gray-500 mt-1">Total pages in the system</p>
        </div>
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="border-l-4 border-green-500 pl-4 py-2">
            <p className="font-medium">User created</p>
            <p className="text-sm text-gray-500">John Admin created a new user: Alice Viewer</p>
            <p className="text-xs text-gray-400">2 hours ago</p>
          </div>
          <div className="border-l-4 border-blue-500 pl-4 py-2">
            <p className="font-medium">Role updated</p>
            <p className="text-sm text-gray-500">John Admin updated the Manager role</p>
            <p className="text-xs text-gray-400">3 hours ago</p>
          </div>
          <div className="border-l-4 border-yellow-500 pl-4 py-2">
            <p className="font-medium">Page added</p>
            <p className="text-sm text-gray-500">John Admin added a new page: User Activity</p>
            <p className="text-xs text-gray-400">1 day ago</p>
          </div>
        </div>
      </div>
    </div>
  )
}
