import SubscriptionPlan from "../../../models/subscriptionPlan.js";
import FarmSubscription from "../../../models/farmSubscription.js";
import { getUserById } from "../../../repo/user.js";
import { ApiError } from "../../../utils/ApiError.js";
import sendSuccessResponse from "../../../utils/responses/sendSuccessResponse.js";
import { recordAuditLog } from "../../../utils/audit/recordAuditLog.js";
import { BillingCycle } from "../../../constants/index.js";

const adminName = (a) => [a?.firstname, a?.lastname].filter(Boolean).join(" ").trim() || null;

export const createPlan = async (req, res, next) => {
    try {
        const { userId, body } = req;
        const admin = await getUserById(userId, true);
        if (!admin) throw new ApiError("Unauthorized", 401, "Unauthorized access.", true);

        const {
            name, description, price, currency = "USD", billing_cycle = "monthly",
            max_animals = null, max_employees = null, features = [], trial_days = 0, is_active = true,
        } = body || {};

        if (!name || !name.trim()) throw new ApiError("Invalid Details", 400, "Plan name is required.", true);
        if (price === undefined || isNaN(parseFloat(price)) || parseFloat(price) < 0) {
            throw new ApiError("Invalid Details", 400, "A valid plan price is required.", true);
        }
        if (!Object.values(BillingCycle).includes(billing_cycle)) {
            throw new ApiError("Invalid Details", 400, "Invalid billing cycle.", true);
        }

        const exists = await SubscriptionPlan.findOne({ where: { name: name.trim(), isDeleted: false } });
        if (exists) throw new ApiError("Invalid Details", 400, "A plan with this name already exists.", true);

        const plan = await SubscriptionPlan.create({
            name: name.trim(),
            description,
            price: parseFloat(price),
            currency,
            billing_cycle,
            max_animals: max_animals === null || max_animals === "" ? null : parseInt(max_animals, 10),
            max_employees: max_employees === null || max_employees === "" ? null : parseInt(max_employees, 10),
            features: Array.isArray(features) ? features : [],
            trial_days: parseInt(trial_days, 10) || 0,
            is_active: Boolean(is_active),
            createdBy: userId,
            updatedBy: userId,
        });

        await recordAuditLog({
            req, adminName: adminName(admin), action: "plan.create",
            entityType: "plan", entityId: plan.uuid, description: `Created plan "${plan.name}"`,
        });

        return sendSuccessResponse(res, 201, true, "Subscription plan created successfully.", "plan", { plan });
    } catch (error) {
        next(error);
    }
};

export const getPlans = async (req, res, next) => {
    try {
        const { userId, query: { is_active, limit = 50, page = 1 } } = req;
        const admin = await getUserById(userId, true);
        if (!admin) throw new ApiError("Unauthorized", 401, "Unauthorized access.", true);

        const offset = (page - 1) * limit;
        const where = { isDeleted: false };
        if (is_active !== undefined) where.is_active = is_active === "true";

        const { count, rows: plans } = await SubscriptionPlan.findAndCountAll({
            where, offset, limit: Number(limit), order: [["price", "ASC"]],
        });

        return sendSuccessResponse(res, 200, true, "Plans fetched successfully.", "plans", {
            plans,
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

export const updatePlan = async (req, res, next) => {
    try {
        const { userId, query: { planId }, body } = req;
        const admin = await getUserById(userId, true);
        if (!admin) throw new ApiError("Unauthorized", 401, "Unauthorized access.", true);
        if (!planId) throw new ApiError("Invalid Details", 400, "planId is required.", true);

        const plan = await SubscriptionPlan.findOne({ where: { uuid: planId, isDeleted: false } });
        if (!plan) throw new ApiError("Invalid Details", 400, "Plan not found.", true);

        if (body?.billing_cycle && !Object.values(BillingCycle).includes(body.billing_cycle)) {
            throw new ApiError("Invalid Details", 400, "Invalid billing cycle.", true);
        }

        const updatable = ["name", "description", "price", "currency", "billing_cycle", "max_animals", "max_employees", "features", "trial_days", "is_active"];
        const payload = { updatedBy: userId };
        for (const key of updatable) {
            if (body[key] !== undefined) payload[key] = body[key];
        }

        await plan.update(payload);

        await recordAuditLog({
            req, adminName: adminName(admin), action: "plan.update",
            entityType: "plan", entityId: plan.uuid, description: `Updated plan "${plan.name}"`, metadata: payload,
        });

        return sendSuccessResponse(res, 200, true, "Plan updated successfully.", "plan", { plan });
    } catch (error) {
        next(error);
    }
};

export const deletePlan = async (req, res, next) => {
    try {
        const { userId, query: { planId } } = req;
        const admin = await getUserById(userId, true);
        if (!admin) throw new ApiError("Unauthorized", 401, "Unauthorized access.", true);
        if (!planId) throw new ApiError("Invalid Details", 400, "planId is required.", true);

        const plan = await SubscriptionPlan.findOne({ where: { uuid: planId, isDeleted: false } });
        if (!plan) throw new ApiError("Invalid Details", 400, "Plan not found.", true);

        const inUse = await FarmSubscription.count({
            where: { planId, isDeleted: false, status: ["trialing", "active", "past_due"] },
        });
        if (inUse > 0) {
            throw new ApiError("Invalid Details", 400, "Plan is assigned to active subscriptions and cannot be deleted.", true);
        }

        await plan.update({ isDeleted: true, is_active: false, updatedBy: userId });

        await recordAuditLog({
            req, adminName: adminName(admin), action: "plan.delete",
            entityType: "plan", entityId: plan.uuid, description: `Deleted plan "${plan.name}"`,
        });

        return sendSuccessResponse(res, 200, true, "Plan deleted successfully.", "plan", { uuid: plan.uuid });
    } catch (error) {
        next(error);
    }
};
