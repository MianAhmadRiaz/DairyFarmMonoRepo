import FarmFeatureFlag from "../../../models/farmFeatureFlag.js";
import Farms from "../../../models/farm.js";
import { getUserById } from "../../../repo/user.js";
import { ApiError } from "../../../utils/ApiError.js";
import sendSuccessResponse from "../../../utils/responses/sendSuccessResponse.js";
import { recordAuditLog } from "../../../utils/audit/recordAuditLog.js";
import { invalidateFarmAccessCache } from "../../../middlewares/farmAccessGuard.js";
import { AppModules } from "../../../constants/index.js";

const adminName = (a) => [a?.firstname, a?.lastname].filter(Boolean).join(" ").trim() || null;

// Returns one entry per known module. A missing DB row means the module is enabled.
export const getFarmFeatureFlags = async (req, res, next) => {
    try {
        const { userId, query: { farmId } } = req;
        const admin = await getUserById(userId, true);
        if (!admin) throw new ApiError("Unauthorized", 401, "Unauthorized access.", true);
        if (!farmId) throw new ApiError("Invalid Details", 400, "farmId is required.", true);

        const farm = await Farms.findOne({ where: { uuid: farmId, isDeleted: false } });
        if (!farm) throw new ApiError("Invalid Details", 400, "Farm not found.", true);

        const rows = await FarmFeatureFlag.findAll({ where: { farmId, isDeleted: false } });
        const byKey = rows.reduce((acc, r) => ({ ...acc, [r.module_key]: r.is_enabled }), {});

        const flags = Object.values(AppModules).map((module_key) => ({
            module_key,
            is_enabled: byKey[module_key] === undefined ? true : byKey[module_key],
        }));

        return sendSuccessResponse(res, 200, true, "Feature flags fetched successfully.", "featureFlags", { farmId, flags });
    } catch (error) {
        next(error);
    }
};

export const setFarmFeatureFlag = async (req, res, next) => {
    try {
        const { userId, body } = req;
        const admin = await getUserById(userId, true);
        if (!admin) throw new ApiError("Unauthorized", 401, "Unauthorized access.", true);

        const { farmId, module_key, is_enabled } = body || {};
        if (!farmId || !module_key) throw new ApiError("Invalid Details", 400, "farmId and module_key are required.", true);
        if (!Object.values(AppModules).includes(module_key)) {
            throw new ApiError("Invalid Details", 400, "Unknown module_key.", true);
        }
        if (typeof is_enabled !== "boolean") {
            throw new ApiError("Invalid Details", 400, "is_enabled must be a boolean.", true);
        }

        const farm = await Farms.findOne({ where: { uuid: farmId, isDeleted: false } });
        if (!farm) throw new ApiError("Invalid Details", 400, "Farm not found.", true);

        const existing = await FarmFeatureFlag.findOne({ where: { farmId, module_key, isDeleted: false } });
        let flag;
        if (existing) {
            flag = await existing.update({ is_enabled, updatedBy: userId });
        } else {
            flag = await FarmFeatureFlag.create({ farmId, module_key, is_enabled, updatedBy: userId });
        }

        invalidateFarmAccessCache(farmId);
        await recordAuditLog({
            req, adminName: adminName(admin), action: "feature_flag.set",
            entityType: "feature_flag", entityId: flag.uuid,
            description: `Set module "${module_key}" to ${is_enabled ? "enabled" : "disabled"} for farm "${farm.name}"`,
        });

        return sendSuccessResponse(res, 200, true, "Feature flag updated successfully.", "featureFlag", { flag });
    } catch (error) {
        next(error);
    }
};
