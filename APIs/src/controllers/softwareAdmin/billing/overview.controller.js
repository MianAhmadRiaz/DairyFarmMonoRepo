import { Op } from "sequelize";
import FarmSubscription from "../../../models/farmSubscription.js";
import FarmPayment from "../../../models/farmPayment.js";
import Farms from "../../../models/farm.js";
import { getUserById } from "../../../repo/user.js";
import { ApiError } from "../../../utils/ApiError.js";
import sendSuccessResponse from "../../../utils/responses/sendSuccessResponse.js";
import { toDateOnly } from "../../../utils/billing/billingUtils.js";
import { SubscriptionStatus, PaymentStatus } from "../../../constants/index.js";

// High-level billing dashboard metrics for the software owner.
export const getBillingOverview = async (req, res, next) => {
    try {
        const { userId } = req;
        const admin = await getUserById(userId, true);
        if (!admin) throw new ApiError("Unauthorized", 401, "Unauthorized access.", true);

        const now = new Date();
        const monthStart = toDateOnly(new Date(now.getFullYear(), now.getMonth(), 1));
        const monthEnd = toDateOnly(new Date(now.getFullYear(), now.getMonth() + 1, 0));

        const [
            totalFarms, activeFarms, suspendedFarms,
            trialing, active, pastDue, suspended, cancelled,
            monthRevenue, totalRevenue, overdueSubscriptions, recentPayments,
        ] = await Promise.all([
            Farms.count({ where: { isDeleted: false } }),
            Farms.count({ where: { isDeleted: false, is_active: true } }),
            Farms.count({ where: { isDeleted: false, is_active: false } }),
            FarmSubscription.count({ where: { isDeleted: false, status: SubscriptionStatus.TRIALING } }),
            FarmSubscription.count({ where: { isDeleted: false, status: SubscriptionStatus.ACTIVE } }),
            FarmSubscription.count({ where: { isDeleted: false, status: SubscriptionStatus.PAST_DUE } }),
            FarmSubscription.count({ where: { isDeleted: false, status: SubscriptionStatus.SUSPENDED } }),
            FarmSubscription.count({ where: { isDeleted: false, status: SubscriptionStatus.CANCELLED } }),
            FarmPayment.sum("amount", { where: { isDeleted: false, status: PaymentStatus.PAID, payment_date: { [Op.between]: [monthStart, monthEnd] } } }),
            FarmPayment.sum("amount", { where: { isDeleted: false, status: PaymentStatus.PAID } }),
            FarmSubscription.findAll({
                where: { isDeleted: false, status: [SubscriptionStatus.PAST_DUE, SubscriptionStatus.SUSPENDED] },
                include: [{ model: Farms, as: "farm", attributes: ["uuid", "name", "is_active"] }],
                order: [["next_due_date", "ASC"]],
                limit: 20,
            }),
            FarmPayment.findAll({
                where: { isDeleted: false },
                include: [{ model: Farms, as: "farm", attributes: ["uuid", "name"] }],
                order: [["createdAt", "DESC"]],
                limit: 10,
            }),
        ]);

        const overview = {
            farms: { total: totalFarms, active: activeFarms, suspended: suspendedFarms },
            subscriptions: { trialing, active, past_due: pastDue, suspended, cancelled },
            revenue: { thisMonth: Number(monthRevenue || 0), total: Number(totalRevenue || 0) },
            overdueSubscriptions,
            recentPayments,
        };

        return sendSuccessResponse(res, 200, true, "Billing overview fetched successfully.", "overview", { overview });
    } catch (error) {
        next(error);
    }
};
