import { Op } from "sequelize";
import User from "../../../models/user.js";
import Farms from "../../../models/farm.js";
import Animal from "../../../models/animal.js";
import Employee from "../../../models/employee.js";
import FarmSubscription from "../../../models/farmSubscription.js";
import { getUserById } from "../../../repo/user.js";
import { ApiError } from "../../../utils/ApiError.js";
import { recordAuditLog } from "../../../utils/audit/recordAuditLog.js";
import { RoleTypes } from "../../../constants/index.js";
import signJwtToken from "../../../utils/signJWT.js";
import SEND_SANITIZED_SUCCESS_RESPONSE from "../../../utils/responses/sendSanitizedSuccessResponse.js";
import sendSuccessResponse from "../../../utils/responses/sendSuccessResponse.js";

const adminName = (a) => [a?.firstname, a?.lastname].filter(Boolean).join(" ").trim() || null;

// Issue a short-lived farm token so an admin can log into a farm's dashboard
// for support/debugging. The token is marked `impersonatedBy` for audit.
export const impersonateFarm = async (req, res, next) => {
    try {
        const { userId, query: { farmId } } = req;
        const admin = await getUserById(userId, true);
        if (!admin) throw new ApiError("Unauthorized", 401, "Unauthorized access.", true);
        if (!farmId) throw new ApiError("Invalid Details", 400, "farmId is required.", true);

        const farm = await Farms.findOne({ where: { uuid: farmId, isDeleted: false }, raw: true });
        if (!farm) throw new ApiError("Invalid Details", 400, "Farm not found.", true);

        // Impersonate the farm's owner (earliest, non-deleted user).
        const owner = await User.findOne({
            where: { farmId, isDeleted: false },
            order: [["createdAt", "ASC"]],
        });
        if (!owner) throw new ApiError("Invalid Details", 400, "This farm has no users to impersonate.", true);

        // 1-hour scoped token — carries impersonatedBy so downstream can distinguish.
        const payload = {
            userId: owner.uuid,
            role: RoleTypes.SUPER_ADMIN,
            impersonatedBy: admin.uuid,
        };
        const token = signJwtToken(payload, "1h");

        await recordAuditLog({
            req, adminName: adminName(admin), action: "farm.impersonate",
            entityType: "farm", entityId: farmId,
            description: `Impersonated farm "${farm.name}" as user ${owner.email}`,
        });

        const sanitizedUser = SEND_SANITIZED_SUCCESS_RESPONSE(owner.get({ plain: true }));
        return sendSuccessResponse(res, 200, true, "Impersonation token issued (valid 1 hour).", "impersonation", {
            token,
            user: sanitizedUser,
            farm: { uuid: farm.uuid, name: farm.name },
        });
    } catch (error) {
        next(error);
    }
};

// Per-farm usage snapshot vs plan limits — the control panel's at-a-glance view.
export const getFarmUsage = async (req, res, next) => {
    try {
        const { userId, query: { farmId } } = req;
        const admin = await getUserById(userId, true);
        if (!admin) throw new ApiError("Unauthorized", 401, "Unauthorized access.", true);
        if (!farmId) throw new ApiError("Invalid Details", 400, "farmId is required.", true);

        const [animalCount, employeeCount, subscription] = await Promise.all([
            Animal.count({ where: { farmId, isDeleted: false } }),
            Employee.count({ where: { farmId, isDeleted: false } }),
            FarmSubscription.findOne({
                where: { farmId, isDeleted: false },
                order: [["createdAt", "DESC"]],
                include: [{ association: "plan" }],
            }),
        ]);

        const plan = subscription?.plan;
        const usage = {
            animals: {
                used: animalCount,
                limit: plan?.max_animals ?? null,
                overLimit: plan?.max_animals != null && animalCount > plan.max_animals,
            },
            employees: {
                used: employeeCount,
                limit: plan?.max_employees ?? null,
                overLimit: plan?.max_employees != null && employeeCount > plan.max_employees,
            },
            subscription: subscription
                ? {
                    plan_name: subscription.plan_name,
                    status: subscription.status,
                    pricing_model: subscription.pricing_model,
                    amount: subscription.amount,
                    billed_animal_count: subscription.billed_animal_count,
                    next_due_date: subscription.next_due_date,
                }
                : null,
        };

        return sendSuccessResponse(res, 200, true, "Farm usage fetched successfully.", "usage", usage);
    } catch (error) {
        next(error);
    }
};

export default { impersonateFarm, getFarmUsage };
