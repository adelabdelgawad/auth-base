import React from 'react'
import RolesTable from './roles-table'
import { getRoles } from '@/actions/role-actions'
import { getPages } from '@/actions/page-actions'

async function page() {
    const pages = await getPages()
    const roles = await getRoles()
  return <RolesTable pages={pages} roles={roles} />;
}

export default page