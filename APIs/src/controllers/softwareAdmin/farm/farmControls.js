import Farms from "../../../models/farm.js";
import FarmSubscription from "../../../models/farmSubscription.js";
import { getUserById } from "../../../repo/user.js";
import { ApiError } from "../../../utils/ApiError.js";
import { recordAuditLog } from "../../../utils/audit/recordAuditLog.js";
import { invalidateFarmAccessCache } from "../../../middlewares/farmAccessGuard.js";
import { DiscountTypes } from "../../../constants/index.js";
import sendSuccessResponse from "../../../utils/responses/sendSuccessResponse.js";

const adminName = (a) => [a?.firstname, a?.lastname].filter(Boolean).join(" ").trim() || null;

// Hard revoke / restore a farm's access — independent of subscription. A revoked
// farm is locked out of every operational module regardless of its plan.
export const revokeFarm = async (req, res, next) => {
    try {
        const { userId, body: { farmId, revoke = true, reason } } = req;
        const admin = await getUserById(userId, true);
        if (!admin) throw new ApiError("Unauthorized", 401, "Unauthorized access.", true);
        if (!farmId) throw new ApiError("Invalid Details", 400, "farmId is required.", true);

        const farm = await Farms.findOne({ where: { uuid: farmId, isDeleted: false } });
        if (!farm) throw new ApiError("Invalid Details", 400, "Farm not found.", true);

        await farm.update({
            is_revoked: Boolean(revoke),
            revoked_at: revoke ? new Date() : null,
            revoke_reason: revoke ? (reason || null) : null,
            // Revoking also deactivates; restoring re-activates so they can work again.
            is_active: revoke ? false : true,
        });
        invalidateFarmAccessCache(farmId);

        await recordAuditLog({
            req, adminName: adminName(admin), action: revoke ? "farm.revoke" : "farm.restore",
            entityType: "farm", entityId: farmId,
            description: revoke ? `Revoked access for farm "${farm.name}"${reason ? `: ${reason}` : ""}` : `Restored access for farm "${farm.name}"`,
        });

        return sendSuccessResponse(res, 200, true, revoke ? "Farm access revoked." : "Farm access restored.", "farm", { farm });
    } catch (error) {
        next(error);
    }
};

// Set or clear a per-farm discount. Applies to the CURRENT live subscription's
// amount immediately, and to future renewals.
export const setFarmDiscount = async (req, res, next) => {
    try {
        const { userId, body: { farmId, discount_type = "none", discount_value = 0, discount_note } } = req;
        const admin = await getUserById(userId, true);
        if (!admin) throw new ApiError("Unauthorized", 401, "Unauthorized access.", true);
        if (!farmId) throw new ApiError("Invalid Details", 400, "farmId is required.", true);
        if (!Object.values(DiscountTypes).includes(discount_type)) {
            throw new ApiError("Invalid Details", 400, "discount_type must be none, percentage, or flat.", true);
        }
        const value = Number(discount_value) || 0;
        if (discount_type === "percentage" && (value < 0 || value > 100)) {
            throw new ApiError("Invalid Details", 400, "Percentage discount must be between 0 and 100.", true);
        }
        if (value < 0) throw new ApiError("Invalid Details", 400, "Discount value cannot be negative.", true);

        const farm = await Farms.findOne({ where: { uuid: farmId, isDeleted: false } });
        if (!farm) throw new ApiError("Invalid Details", 400, "Farm not found.", true);

        await farm.update({
            discount_type,
            discount_value: discount_type === "none" ? 0 : value,
            discount_note: discount_type === "none" ? null : (discount_note || null),
        });

        // Re-apply to the live subscription's amount so the next invoice reflects it.
        const subscription = await FarmSubscription.findOne({
            where: { farmId, isDeleted: false },
            order: [["createdAt", "DESC"]],
        });
        if (subscription) {
            const { applyDiscount } = await import("../../../utils/billing/billingUtils.js");
            const gross = Number(subscription.gross_amount || subscription.amount || 0);
            const net = Number(applyDiscount(gross, discount_type, discount_type === "none" ? 0 : value).toFixed(2));
            await subscription.update({
                discount_type,
                discount_value: discount_type === "none" ? 0 : value,
                amount: net,
                updatedBy: userId,
            });
        }

        await recordAuditLog({
            req, adminName: adminName(admin), action: "farm.discount",
            entityType: "farm", entityId: farmId,
            description: `Set discount for farm "${farm.name}": ${discount_type} ${discount_type === "none" ? "" : value}`,
        });

        return sendSuccessResponse(res, 200, true, "Farm discount updated.", "farm", { farm });
    } catch (error) {
        next(error);
    }
};

export default { revokeFarm, setFarmDiscount };
