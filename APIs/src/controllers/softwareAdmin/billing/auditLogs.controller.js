import { Op } from "sequelize";
import AdminAuditLog from "../../../models/adminAuditLog.js";
import { getUserById } from "../../../repo/user.js";
import { ApiError } from "../../../utils/ApiError.js";
import sendSuccessResponse from "../../../utils/responses/sendSuccessResponse.js";

export const getAuditLogs = async (req, res, next) => {
    try {
        const { userId, query: { action, entity_type, adminId, limit = 25, page = 1 } } = req;
        const admin = await getUserById(userId, true);
        if (!admin) throw new ApiError("Unauthorized", 401, "Unauthorized access.", true);

        const offset = (page - 1) * limit;
        const where = {};
        if (action) where.action = { [Op.iLike]: `%${action}%` };
        if (entity_type) where.entity_type = entity_type;
        if (adminId) where.adminId = adminId;

        const { count, rows: logs } = await AdminAuditLog.findAndCountAll({
            where,
            offset,
            limit: Number(limit),
            order: [["createdAt", "DESC"]],
        });

        return sendSuccessResponse(res, 200, true, "Audit logs fetched successfully.", "auditLogs", {
            logs,
            page: Number(page),
            totalPages: Math.ceil(count / limit),
            limit: Number(limit),
            skip: offset,
            totalCount: Number(count),
        });
    } catch (error) {
        next(error);
    }
};
