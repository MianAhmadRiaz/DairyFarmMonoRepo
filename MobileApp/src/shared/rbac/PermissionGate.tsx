import React from 'react'
import usePermissions from './usePermissions'
import { PermissionName } from './permissions'

// Renders children only when the user holds the given permission(s). Otherwise
// renders `fallback` (default: nothing). Owner always passes.
interface Props {
  permission: PermissionName | PermissionName[]
  requireAll?: boolean
  fallback?: React.ReactNode
  children: React.ReactNode
}

const PermissionGate = ({ permission, requireAll, fallback = null, children }: Props) => {
  const { can, canAll } = usePermissions()
  const allowed = requireAll && Array.isArray(permission)
    ? canAll(permission)
    : can(permission)
  return <>{allowed ? children : fallback}</>
}

export default PermissionGate
