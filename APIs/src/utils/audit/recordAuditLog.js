import AdminAuditLog from "../../models/adminAuditLog.js";
import logger from "../../logger/index.js";

/**
 * Records an action performed by a software administrator.
 * Never throws — auditing must not break the primary operation.
 *
 * @param {object} params
 * @param {object} [params.req]         Express request (used to derive admin + ip).
 * @param {string} [params.adminId]
 * @param {string} [params.adminName]
 * @param {string}  params.action       e.g. "plan.create"
 * @param {string} [params.entityType]  e.g. "plan"
 * @param {string} [params.entityId]
 * @param {string} [params.description]
 * @param {object} [params.metadata]
 */
export async function recordAuditLog({
    req,
    adminId,
    adminName,
    action,
    entityType = null,
    entityId = null,
    description = null,
    metadata = null,
} = {}) {
    try {
        const resolvedAdminId = adminId || req?.userId || null;
        const ip = req?.headers?.["x-forwarded-for"] || req?.socket?.remoteAddress || null;
        await AdminAuditLog.create({
            adminId: resolvedAdminId,
            admin_name: adminName || null,
            action,
            entity_type: entityType,
            entity_id: entityId,
            description,
            metadata,
            ip_address: Array.isArray(ip) ? ip[0] : ip,
        });
    } catch (error) {
        logger.error(`recordAuditLog failed for action "${action}": ${error.message}`);
    }
}

export default recordAuditLog;
