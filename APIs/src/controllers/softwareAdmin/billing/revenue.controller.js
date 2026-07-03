import { Op, fn, col, literal } from "sequelize";
import FarmSubscription from "../../../models/farmSubscription.js";
import FarmPayment from "../../../models/farmPayment.js";
import SubscriptionPlan from "../../../models/subscriptionPlan.js";
import Farms from "../../../models/farm.js";
import { getUserById } from "../../../repo/user.js";
import { ApiError } from "../../../utils/ApiError.js";
import sendSuccessResponse from "../../../utils/responses/sendSuccessResponse.js";
import { toDateOnly } from "../../../utils/billing/billingUtils.js";
import { SubscriptionStatus, PaymentStatus } from "../../../constants/index.js";

// Normalizes a subscription's amount to a monthly figure for MRR.
const CYCLE_TO_MONTHS = { monthly: 1, quarterly: 3, half_yearly: 6, yearly: 12 };
const toMonthly = (amount, cycle) => Number(amount || 0) / (CYCLE_TO_MONTHS[cycle] || 1);

// The software owner's revenue/finance dashboard: MRR, ARR, collections,
// outstanding receivables, 6-month trend, and revenue by plan.
export const getRevenueDashboard = async (req, res, next) => {
    try {
        const { userId } = req;
        const admin = await getUserById(userId, true);
        if (!admin) throw new ApiError("Unauthorized", 401, "Unauthorized access.", true);

        const now = new Date();
        const monthStart = toDateOnly(new Date(now.getFullYear(), now.getMonth(), 1));
        const monthEnd = toDateOnly(new Date(now.getFullYear(), now.getMonth() + 1, 0));

        // Live (revenue-generating) subscriptions for MRR.
        const liveSubs = await FarmSubscription.findAll({
            where: { isDeleted: false, status: [SubscriptionStatus.ACTIVE, SubscriptionStatus.PAST_DUE] },
            attributes: ["amount", "billing_cycle", "currency"],
            raw: true,
        });
        const currency = liveSubs[0]?.currency || "PKR";
        const mrr = liveSubs.reduce((sum, s) => sum + toMonthly(s.amount, s.billing_cycle), 0);

        const [
            collectedThisMonth, collectedTotal, pendingPayments,
            outstandingAgg, byPlan,
        ] = await Promise.all([
            FarmPayment.sum("amount", { where: { isDeleted: false, status: PaymentStatus.PAID, payment_date: { [Op.between]: [monthStart, monthEnd] } } }),
            FarmPayment.sum("amount", { where: { isDeleted: false, status: PaymentStatus.PAID } }),
            FarmPayment.sum("amount", { where: { isDeleted: false, status: PaymentStatus.PENDING } }),
            // Outstanding = amount of subscriptions past due / suspended (owed but unpaid).
            FarmSubscription.sum("amount", { where: { isDeleted: false, status: [SubscriptionStatus.PAST_DUE, SubscriptionStatus.SUSPENDED] } }),
            // Revenue and farm count grouped by plan.
            FarmSubscription.findAll({
                where: { isDeleted: false, status: [SubscriptionStatus.ACTIVE, SubscriptionStatus.PAST_DUE, SubscriptionStatus.TRIALING] },
                attributes: [
                    "plan_name",
                    [fn("COUNT", col("farm_subscriptions.uuid")), "farmCount"],
                    [fn("SUM", col("amount")), "totalAmount"],
                ],
                group: ["plan_name"],
                raw: true,
            }),
        ]);

        // 6-month paid-revenue trend.
        const sixMonthsAgo = toDateOnly(new Date(now.getFullYear(), now.getMonth() - 5, 1));
        const trendRows = await FarmPayment.findAll({
            where: { isDeleted: false, status: PaymentStatus.PAID, payment_date: { [Op.gte]: sixMonthsAgo } },
            attributes: [
                [fn("to_char", col("payment_date"), literal("'YYYY-MM'")), "month"],
                [fn("SUM", col("amount")), "total"],
            ],
            group: [literal("to_char(payment_date, 'YYYY-MM')")],
            order: [literal("to_char(payment_date, 'YYYY-MM') ASC")],
            raw: true,
        });

        const dashboard = {
            currency,
            mrr: Number(mrr.toFixed(2)),
            arr: Number((mrr * 12).toFixed(2)),
            collectedThisMonth: Number(collectedThisMonth || 0),
            collectedTotal: Number(collectedTotal || 0),
            pendingPayments: Number(pendingPayments || 0),
            outstanding: Number(outstandingAgg || 0),
            revenueByPlan: byPlan.map((p) => ({
                plan_name: p.plan_name,
                farmCount: Number(p.farmCount),
                totalAmount: Number(p.totalAmount || 0),
            })),
            trend: trendRows.map((r) => ({ month: r.month, total: Number(r.total || 0) })),
        };

        return sendSuccessResponse(res, 200, true, "Revenue dashboard fetched successfully.", "revenue", { dashboard });
    } catch (error) {
        next(error);
    }
};

// Paginated list of ALL payments across farms (the collections ledger).
export const getAllPayments = async (req, res, next) => {
    try {
        const { userId, query: { status, farmId, limit = 25, page = 1 } } = req;
        const admin = await getUserById(userId, true);
        if (!admin) throw new ApiError("Unauthorized", 401, "Unauthorized access.", true);

        const offset = (page - 1) * limit;
        const where = { isDeleted: false };
        if (status) where.status = status;
        if (farmId) where.farmId = farmId;

        const { count, rows: payments } = await FarmPayment.findAndCountAll({
            where,
            offset,
            limit: Number(limit),
            order: [["payment_date", "DESC"], ["createdAt", "DESC"]],
            include: [{ model: Farms, as: "farm", attributes: ["uuid", "name"] }],
        });

        return sendSuccessResponse(res, 200, true, "Payments fetched successfully.", "payments", {
            payments,
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

export default { getRevenueDashboard, getAllPayments };
