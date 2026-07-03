import { useSelector } from 'react-redux'
import { RootState } from 'shared/store/configureStore'
import { PermissionName } from './permissions'

// Reads the logged-in user's permissions from redux and exposes helpers to
// render UI per role. The Owner role (isOwner) is allowed everything.
export function usePermissions() {
  const user = useSelector((state: RootState) => state.user.user) as
    | { permissions?: string[]; isOwner?: boolean; roleName?: string }
    | undefined

  const permissions: string[] = user?.permissions || []
  const isOwner = Boolean(user?.isOwner)

  // can = holds ANY of the given permissions (or is Owner).
  const can = (perm: PermissionName | PermissionName[]): boolean => {
    if (isOwner) return true
    const list = Array.isArray(perm) ? perm : [perm]
    return list.some(p => permissions.includes(p))
  }

  // canAll = holds ALL of the given permissions (or is Owner).
  const canAll = (perms: PermissionName[]): boolean => {
    if (isOwner) return true
    return perms.every(p => permissions.includes(p))
  }

  return { can, canAll, isOwner, permissions, roleName: user?.roleName }
}

export default usePermissions
