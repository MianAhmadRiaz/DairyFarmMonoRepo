import FarmSubscription from "../../../models/farmSubscription.js";
import SubscriptionPlan from "../../../models/subscriptionPlan.js";
import FarmPayment from "../../../models/farmPayment.js";
import FarmConfiguration from "../../../models/farmConfiguration.js";
import Farms from "../../../models/farm.js";
import { getUserById } from "../../../repo/user.js";
import { ApiError } from "../../../utils/ApiError.js";
import sendSuccessResponse from "../../../utils/responses/sendSuccessResponse.js";
import { recordAuditLog } from "../../../utils/audit/recordAuditLog.js";
import { addBillingCycle, toDateOnly } from "../../../utils/billing/billingUtils.js";
import { computeSubscriptionAmount } from "../../../utils/billing/subscriptionAmount.js";
import { invalidateFarmAccessCache } from "../../../middlewares/farmAccessGuard.js";
import { SubscriptionStatus } from "../../../constants/index.js";

const adminName = (a) => [a?.firstname, a?.lastname].filter(Boolean).join(" ").trim() || null;

// Assign (or re-assign) a subscription plan to a farm. Any existing active
// subscription for the farm is cancelled so a farm has one live subscription.
export const assignSubscription = async (req, res, next) => {
    try {
        const { userId, body } = req;
        const admin = await getUserById(userId, true);
        if (!admin) throw new ApiError("Unauthorized", 401, "Unauthorized access.", true);

        const { farmId, planId, start_date, grace_days, auto_suspend = true } = body || {};
        if (!farmId || !planId) throw new ApiError("Invalid Details", 400, "farmId and planId are required.", true);

        const farm = await Farms.findOne({ where: { uuid: farmId, isDeleted: false } });
        if (!farm) throw new ApiError("Invalid Details", 400, "Farm not found.", true);

        const plan = await SubscriptionPlan.findOne({ where: { uuid: planId, isDeleted: false } });
        if (!plan) throw new ApiError("Invalid Details", 400, "Plan not found.", true);

        // Cancel current live subscriptions for this farm.
        await FarmSubscription.update(
            { status: SubscriptionStatus.CANCELLED, cancelled_at: new Date(), updatedBy: userId },
            { where: { farmId, isDeleted: false, status: [SubscriptionStatus.TRIALING, SubscriptionStatus.ACTIVE, SubscriptionStatus.PAST_DUE, SubscriptionStatus.SUSPENDED] } }
        );

        const start = start_date ? new Date(start_date) : new Date();
        const isTrial = (plan.trial_days || 0) > 0;
        let nextDue;
        if (isTrial) {
            nextDue = new Date(start);
            nextDue.setDate(nextDue.getDate() + plan.trial_days);
        } else {
            nextDue = addBillingCycle(start, plan.billing_cycle);
        }

        // Compute the billable amount: per-animal snapshot + per-farm discount.
        const { grossAmount, netAmount, animalCount, discount_type, discount_value } =
            await computeSubscriptionAmount(plan, farmId);

        const subscription = await FarmSubscription.create({
            farmId,
            planId: plan.uuid,
            plan_name: plan.name,
            amount: isTrial ? 0 : netAmount,
            gross_amount: isTrial ? 0 : grossAmount,
            currency: plan.currency,
            billing_cycle: plan.billing_cycle,
            pricing_model: plan.pricing_model,
            per_animal_rate: plan.per_animal_rate,
            billed_animal_count: animalCount,
            discount_type,
            discount_value,
            status: isTrial ? SubscriptionStatus.TRIALING : SubscriptionStatus.ACTIVE,
            start_date: toDateOnly(start),
            current_period_start: toDateOnly(start),
            next_due_date: toDateOnly(nextDue),
            grace_days: grace_days !== undefined ? parseInt(grace_days, 10) : 7,
            auto_suspend: Boolean(auto_suspend),
            createdBy: userId,
            updatedBy: userId,
        });

        // Re-enable farm access on (re)assignment.
        await farm.update({ is_active: true });
        invalidateFarmAccessCache(farmId);

        // Sync the plan's resource caps into the farm's config so the existing
        // add-animal / add-employee limit checks enforce the plan. null = a very
        // high ceiling (effectively unlimited).
        const LARGE = 1000000;
        await FarmConfiguration.update(
            {
                allowed_animals: plan.max_animals == null ? LARGE : plan.max_animals,
                allowed_employees: plan.max_employees == null ? LARGE : plan.max_employees,
            },
            { where: { farmId } }
        );

        await recordAuditLog({
            req, adminName: adminName(admin), action: "subscription.assign",
            entityType: "subscription", entityId: subscription.uuid,
            description: `Assigned plan "${plan.name}" to farm "${farm.name}" (${plan.pricing_model === "per_animal" ? `${animalCount} animals × ${plan.per_animal_rate}` : "flat"}, net ${netAmount} ${plan.currency})`,
        });

        return sendSuccessResponse(res, 201, true, "Subscription assigned successfully.", "subscription", { subscription });
    } catch (error) {
        next(error);
    }
};

export const getSubscriptions = async (req, res, next) => {
    try {
        const { userId, query: { status, farmId, limit = 20, page = 1 } } = req;
        const admin = await getUserById(userId, true);
        if (!admin) throw new ApiError("Unauthorized", 401, "Unauthorized access.", true);

        const offset = (page - 1) * limit;
        const where = { isDeleted: false };
        if (status) where.status = status;
        if (farmId) where.farmId = farmId;

        const { count, rows: subscriptions } = await FarmSubscription.findAndCountAll({
            where,
            offset,
            limit: Number(limit),
            order: [["createdAt", "DESC"]],
            include: [
                { model: Farms, as: "farm", attributes: ["uuid", "name", "is_active", "isBlocked", "status"] },
                { model: SubscriptionPlan, as: "plan", attributes: ["uuid", "name", "billing_cycle", "features"] },
            ],
        });

        return sendSuccessResponse(res, 200, true, "Subscriptions fetched successfully.", "subscriptions", {
            subscriptions,
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

export const getSubscriptionByFarm = async (req, res, next) => {
    try {
        const { userId, query: { farmId } } = req;
        const admin = await getUserById(userId, true);
        if (!admin) throw new ApiError("Unauthorized", 401, "Unauthorized access.", true);
        if (!farmId) throw new ApiError("Invalid Details", 400, "farmId is required.", true);

        const subscription = await FarmSubscription.findOne({
            where: { farmId, isDeleted: false },
            order: [["createdAt", "DESC"]],
            include: [
                { model: SubscriptionPlan, as: "plan" },
                { model: FarmPayment, as: "payments", required: false, where: { isDeleted: false }, separate: true, order: [["payment_date", "DESC"]] },
            ],
        });

        return sendSuccessResponse(res, 200, true, "Subscription fetched successfully.", "subscription", { subscription });
    } catch (error) {
        next(error);
    }
};

export const updateSubscription = async (req, res, next) => {
    try {
        const { userId, query: { subscriptionId }, body } = req;
        const admin = await getUserById(userId, true);
        if (!admin) throw new ApiError("Unauthorized", 401, "Unauthorized access.", true);
        if (!subscriptionId) throw new ApiError("Invalid Details", 400, "subscriptionId is required.", true);

        const subscription = await FarmSubscription.findOne({ where: { uuid: subscriptionId, isDeleted: false } });
        if (!subscription) throw new ApiError("Invalid Details", 400, "Subscription not found.", true);

        const updatable = ["amount", "billing_cycle", "next_due_date", "grace_days", "auto_suspend"];
        const payload = { updatedBy: userId };
        for (const key of updatable) {
            if (body[key] !== undefined) payload[key] = body[key];
        }
        await subscription.update(payload);

        await recordAuditLog({
            req, adminName: adminName(admin), action: "subscription.update",
            entityType: "subscription", entityId: subscription.uuid, description: "Updated subscription", metadata: payload,
        });

        return sendSuccessResponse(res, 200, true, "Subscription updated successfully.", "subscription", { subscription });
    } catch (error) {
        next(error);
    }
};

// Manually change the live state of a subscription: suspend / reactivate / cancel.
const changeStatus = (targetStatus, action, successMessage) => async (req, res, next) => {
    try {
        const { userId, query: { subscriptionId } } = req;
        const admin = await getUserById(userId, true);
        if (!admin) throw new ApiError("Unauthorized", 401, "Unauthorized access.", true);
        if (!subscriptionId) throw new ApiError("Invalid Details", 400, "subscriptionId is required.", true);

        const subscription = await FarmSubscription.findOne({ where: { uuid: subscriptionId, isDeleted: false } });
        if (!subscription) throw new ApiError("Invalid Details", 400, "Subscription not found.", true);

        const patch = { status: targetStatus, updatedBy: userId };
        if (targetStatus === SubscriptionStatus.CANCELLED) patch.cancelled_at = new Date();
        await subscription.update(patch);

        // Gate farm access in line with the subscription state.
        const farm = await Farms.findOne({ where: { uuid: subscription.farmId } });
        if (farm) {
            if (targetStatus === SubscriptionStatus.SUSPENDED || targetStatus === SubscriptionStatus.CANCELLED) {
                await farm.update({ is_active: false });
            } else if (targetStatus === SubscriptionStatus.ACTIVE) {
                await farm.update({ is_active: true });
            }
        }
        invalidateFarmAccessCache(subscription.farmId);

        await recordAuditLog({
            req, adminName: adminName(admin), action,
            entityType: "subscription", entityId: subscription.uuid,
            description: `${action} for farm ${subscription.farmId}`,
        });

        return sendSuccessResponse(res, 200, true, successMessage, "subscription", { subscription });
    } catch (error) {
        next(error);
    }
};

// Extend a subscription's next-due date (trial extension or extra grace) by N
// days — no payment recorded, just more runway.
export const extendSubscription = async (req, res, next) => {
    try {
        const { userId, query: { subscriptionId }, body: { days, new_due_date } } = req;
        const admin = await getUserById(userId, true);
        if (!admin) throw new ApiError("Unauthorized", 401, "Unauthorized access.", true);
        if (!subscriptionId) throw new ApiError("Invalid Details", 400, "subscriptionId is required.", true);

        const subscription = await FarmSubscription.findOne({ where: { uuid: subscriptionId, isDeleted: false } });
        if (!subscription) throw new ApiError("Invalid Details", 400, "Subscription not found.", true);

        let nextDue;
        if (new_due_date) {
            nextDue = new Date(new_due_date);
        } else {
            const d = Number(days);
            if (!Number.isFinite(d) || d === 0) throw new ApiError("Invalid Details", 400, "Provide a non-zero 'days' value or a 'new_due_date'.", true);
            nextDue = new Date(subscription.next_due_date || new Date());
            nextDue.setDate(nextDue.getDate() + d);
        }

        // Reactivating a lapsed subscription that gets more runway.
        const patch = { next_due_date: toDateOnly(nextDue), updatedBy: userId };
        if ([SubscriptionStatus.PAST_DUE, SubscriptionStatus.SUSPENDED].includes(subscription.status)) {
            patch.status = subscription.status === SubscriptionStatus.TRIALING ? SubscriptionStatus.TRIALING : SubscriptionStatus.ACTIVE;
        }
        await subscription.update(patch);

        const farm = await Farms.findOne({ where: { uuid: subscription.farmId } });
        if (farm && !farm.is_active && !farm.is_revoked) await farm.update({ is_active: true });
        invalidateFarmAccessCache(subscription.farmId);

        await recordAuditLog({
            req, adminName: adminName(admin), action: "subscription.extend",
            entityType: "subscription", entityId: subscription.uuid,
            description: `Extended due date to ${toDateOnly(nextDue)}${days ? ` (+${days} days)` : ""}`,
        });

        return sendSuccessResponse(res, 200, true, "Subscription due date extended.", "subscription", { subscription });
    } catch (error) {
        next(error);
    }
};

// Mid-cycle true-up for per-animal plans: re-snapshot the animal count and, if
// it grew, charge the prorated difference for the remaining days of the cycle.
export const trueUpSubscription = async (req, res, next) => {
    try {
        const { userId, query: { subscriptionId } } = req;
        const admin = await getUserById(userId, true);
        if (!admin) throw new ApiError("Unauthorized", 401, "Unauthorized access.", true);
        if (!subscriptionId) throw new ApiError("Invalid Details", 400, "subscriptionId is required.", true);

        const subscription = await FarmSubscription.findOne({ where: { uuid: subscriptionId, isDeleted: false } });
        if (!subscription) throw new ApiError("Invalid Details", 400, "Subscription not found.", true);
        if (subscription.pricing_model !== "per_animal") {
            throw new ApiError("Invalid Details", 400, "True-up only applies to per-animal subscriptions.", true);
        }

        const { getFarmAnimalCount } = await import("../../../utils/billing/subscriptionAmount.js");
        const { applyDiscount, daysBetween, cycleDays } = await import("../../../utils/billing/billingUtils.js");

        const currentCount = await getFarmAnimalCount(subscription.farmId);
        const billedCount = Number(subscription.billed_animal_count || 0);
        const addedAnimals = currentCount - billedCount;

        if (addedAnimals <= 0) {
            return sendSuccessResponse(res, 200, true, "No additional animals since last billing — nothing to true up.", "trueUp", {
                billedCount, currentCount, addedAnimals: 0, proratedCharge: 0,
            });
        }

        // Prorate the added animals over the remaining days of the current cycle.
        const totalCycleDays = cycleDays(subscription.billing_cycle);
        const remainingDays = Math.min(daysBetween(new Date(), subscription.next_due_date), totalCycleDays);
        const perAnimalRate = Number(subscription.per_animal_rate || 0);
        const grossProrated = perAnimalRate * addedAnimals * (remainingDays / totalCycleDays);
        const netProrated = Number(applyDiscount(grossProrated, subscription.discount_type, Number(subscription.discount_value || 0)).toFixed(2));

        // Update the billed count so the next true-up/renewal is relative to now.
        await subscription.update({ billed_animal_count: currentCount, updatedBy: userId });

        await recordAuditLog({
            req, adminName: adminName(admin), action: "subscription.trueup",
            entityType: "subscription", entityId: subscription.uuid,
            description: `True-up: ${addedAnimals} added animals (${billedCount}→${currentCount}), prorated ${netProrated} ${subscription.currency} over ${remainingDays}/${totalCycleDays} days`,
        });

        return sendSuccessResponse(res, 200, true, "Subscription trued up. Record a payment for the prorated charge if collecting now.", "trueUp", {
            billedCount, currentCount, addedAnimals,
            remainingDays, totalCycleDays,
            proratedCharge: netProrated,
            currency: subscription.currency,
        });
    } catch (error) {
        next(error);
    }
};

export const suspendSubscription = changeStatus(SubscriptionStatus.SUSPENDED, "subscription.suspend", "Subscription suspended and farm access disabled.");
export const reactivateSubscription = changeStatus(SubscriptionStatus.ACTIVE, "subscription.reactivate", "Subscription reactivated and farm access enabled.");
export const cancelSubscription = changeStatus(SubscriptionStatus.CANCELLED, "subscription.cancel", "Subscription cancelled.");
