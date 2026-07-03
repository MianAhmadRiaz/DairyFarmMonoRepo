// ─── RBAC repository ──────────────────────────────────────────────────────────
// Seeds the default dairy roles for a farm and resolves a user's effective
// permission NAMES (used by the auth response and the checkPermission middleware).
import { Op } from "sequelize";
import Role from "../models/role.js";
import RoleAndPermission from "../models/role&Permission.js";
import Permissions from "../models/permissions.js";
import { DAIRY_ROLES } from "../constants/rbac.js";

// Cache the permission name→uuid map (global catalog, rarely changes).
let permMapCache = null;
async function getPermissionMap() {
    if (permMapCache) return permMapCache;
    const perms = await Permissions.findAll({ where: { type: "farm" }, attributes: ["uuid", "name"], raw: true });
    permMapCache = new Map(perms.map((p) => [p.name, p.uuid]));
    return permMapCache;
}
export function clearPermissionCache() { permMapCache = null; }

/**
 * Seeds the default dairy roles for a farm (idempotent) and returns the Owner
 * role. Attaches each role's permissions. Call once per farm on signup.
 * @returns {Promise<Role>} the Owner role
 */
export async function seedFarmRoles(farmId, userId) {
    const permMap = await getPermissionMap();
    let ownerRole = null;

    for (const def of DAIRY_ROLES) {
        const [role] = await Role.findOrCreate({
            where: { name: def.name, farmId, isDeleted: false },
            defaults: {
                name: def.name,
                description: def.description,
                isOwner: Boolean(def.isOwner),
                isSystem: true,
                farmId,
                createdBy: userId,
            },
        });
        if (def.isOwner) ownerRole = role;

        // Sync this role's permissions (add any missing rows).
        const wantedIds = def.permissions.map((name) => permMap.get(name)).filter(Boolean);
        const existing = await RoleAndPermission.findAll({
            where: { roleId: role.uuid, isDeleted: false },
            attributes: ["permissionId"],
            raw: true,
        });
        const existingIds = new Set(existing.map((r) => r.permissionId));
        const toAdd = wantedIds.filter((id) => !existingIds.has(id));
        if (toAdd.length) {
            await RoleAndPermission.bulkCreate(toAdd.map((permissionId) => ({ roleId: role.uuid, permissionId })));
        }
    }
    return ownerRole;
}

/**
 * Resolves the effective permission NAMES for a user by their roleId.
 * @returns {Promise<{ permissions: string[], isOwner: boolean, roleName: string|null }>}
 */
export async function getUserPermissions(roleId) {
    if (!roleId) return { permissions: [], isOwner: false, roleName: null };
    const role = await Role.findOne({
        where: { uuid: roleId, isDeleted: false },
        attributes: ["uuid", "name", "isOwner"],
        include: [{
            model: RoleAndPermission,
            as: "rolePermissions",
            attributes: ["permissionId"],
            where: { isDeleted: false },
            required: false,
            include: [{ model: Permissions, as: "permission", attributes: ["name"] }],
        }],
    });
    if (!role) return { permissions: [], isOwner: false, roleName: null };

    const permissions = (role.rolePermissions || [])
        .map((rp) => rp.permission?.name)
        .filter(Boolean);
    return { permissions, isOwner: Boolean(role.isOwner), roleName: role.name };
}

/** Sets a role's permissions to exactly the given list of permission names. */
export async function setRolePermissions(roleId, permissionNames) {
    const permMap = await getPermissionMap();
    const wantedIds = permissionNames.map((n) => permMap.get(n)).filter(Boolean);

    // Soft-delete everything, then upsert the wanted set.
    await RoleAndPermission.update({ isDeleted: true }, { where: { roleId } });
    for (const permissionId of wantedIds) {
        const [row, created] = await RoleAndPermission.findOrCreate({
            where: { roleId, permissionId },
            defaults: { roleId, permissionId, isDeleted: false },
        });
        if (!created) await row.update({ isDeleted: false });
    }
}

export default { seedFarmRoles, getUserPermissions, setRolePermissions, clearPermissionCache };
