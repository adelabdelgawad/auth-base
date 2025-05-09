import React from "react";
import UsersTable from "./users-table";
import { getUsers } from "@/actions/user-actions";
import { getRoles } from "@/actions/role-actions";

async function page() {
  const users = await getUsers();
  const roles = await getRoles();

  return <UsersTable users={users} roles={roles} />;
}

export default page;
