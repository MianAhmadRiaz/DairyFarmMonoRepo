import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { PermissionName } from './permissions';

// Reads the current user's permissions from the persisted auth state and
// exposes helpers to gate UI. The Owner role (isOwner) is allowed everything.
export function usePermissions() {
  const user = useSelector((state: RootState) => state.user.user) as
    | { permissions?: string[]; isOwner?: boolean; roleName?: string }
    | null;

  const permissions: string[] = user?.permissions || [];
  const isOwner = Boolean(user?.isOwner);

  const can = (perm: PermissionName | PermissionName[]): boolean => {
    if (isOwner) return true;
    const list = Array.isArray(perm) ? perm : [perm];
    // "can" = holds ANY of the given permissions.
    return list.some((p) => permissions.includes(p));
  };

  const canAll = (perms: PermissionName[]): boolean => {
    if (isOwner) return true;
    return perms.every((p) => permissions.includes(p));
  };

  return { can, canAll, isOwner, permissions, roleName: user?.roleName };
}

export default usePermissions;
