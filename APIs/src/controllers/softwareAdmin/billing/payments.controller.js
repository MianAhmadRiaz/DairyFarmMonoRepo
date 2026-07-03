import FarmPayment from "../../../models/farmPayment.js";
import FarmSubscription from "../../../models/farmSubscription.js";
import Farms from "../../../models/farm.js";
import { getUserById } from "../../../repo/user.js";
import { ApiError } from "../../../utils/ApiError.js";
import sendSuccessResponse from "../../../utils/responses/sendSuccessResponse.js";
import { recordAuditLog } from "../../../utils/audit/recordAuditLog.js";
import { addBillingCycle, toDateOnly, generateInvoiceNumber } from "../../../utils/billing/billingUtils.js";
import { PaymentStatus, SubscriptionStatus } from "../../../constants/index.js";

const adminName = (a) => [a?.firstname, a?.lastname].filter(Boolean).join(" ").trim() || null;

const PAYMENT_METHODS = ["cash", "bank_transfer", "cheque", "card", "mobile_payment", "other"];

// Manually record a payment against a farm/subscription. A paid payment
// advances the subscription's next due date by one billing cycle and
// reactivates the farm if it was suspended for non-payment.
export const recordPayment = async (req, res, next) => {
    try {
        const { userId, body } = req;
        const admin = await getUserById(userId, true);
        if (!admin) throw new ApiError("Unauthorized", 401, "Unauthorized access.", true);

        const {
            farmId, subscriptionId, amount, currency, method = "cash",
            payment_date, reference, notes, status = PaymentStatus.PAID,
        } = body || {};

        if (!farmId) throw new ApiError("Invalid Details", 400, "farmId is required.", true);
        if (amount === undefined || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
            throw new ApiError("Invalid Details", 400, "A valid payment amount is required.", true);
        }
        if (!PAYMENT_METHODS.includes(method)) {
            throw new ApiError("Invalid Details", 400, "Invalid payment method.", true);
        }
        if (!Object.values(PaymentStatus).includes(status)) {
            throw new ApiError("Invalid Details", 400, "Invalid payment status.", true);
        }

        const farm = await Farms.findOne({ where: { uuid: farmId, isDeleted: false } });
        if (!farm) throw new ApiError("Invalid Details", 400, "Farm not found.", true);

        let subscription = null;
        if (subscriptionId) {
            subscription = await FarmSubscription.findOne({ where: { uuid: subscriptionId, isDeleted: false } });
        } else {
            subscription = await FarmSubscription.findOne({
                where: { farmId, isDeleted: false },
                order: [["createdAt", "DESC"]],
            });
        }

        const periodStart = subscription ? subscription.next_due_date : (payment_date || toDateOnly(new Date()));
        const periodEnd = subscription ? toDateOnly(addBillingCycle(periodStart, subscription.billing_cycle)) : null;

        const payment = await FarmPayment.create({
            farmId,
            subscriptionId: subscription ? subscription.uuid : null,
            invoice_number: generateInvoiceNumber(),
            amount: parseFloat(amount),
            currency: currency || (subscription ? subscription.currency : "USD"),
            status,
            method,
            payment_date: payment_date || toDateOnly(new Date()),
            period_start: periodStart,
            period_end: periodEnd,
            reference,
            notes,
            recordedBy: userId,
        });

        // On a successful payment, roll the subscription forward and restore access.
        if (status === PaymentStatus.PAID && subscription) {
            const nextDue = addBillingCycle(subscription.next_due_date, subscription.billing_cycle);
            await subscription.update({
                status: SubscriptionStatus.ACTIVE,
                current_period_start: subscription.next_due_date,
                next_due_date: toDateOnly(nextDue),
                updatedBy: userId,
            });
            if (!farm.is_active) await farm.update({ is_active: true });
        }

        await recordAuditLog({
            req, adminName: adminName(admin), action: "payment.record",
            entityType: "payment", entityId: payment.uuid,
            description: `Recorded ${status} payment ${payment.invoice_number} (${payment.amount} ${payment.currency}) for farm "${farm.name}"`,
        });

        return sendSuccessResponse(res, 201, true, "Payment recorded successfully.", "payment", { payment });
    } catch (error) {
        next(error);
    }
};

export const getPayments = async (req, res, next) => {
    try {
        const { userId, query: { farmId, status, limit = 20, page = 1 } } = req;
        const admin = await getUserById(userId, true);
        if (!admin) throw new ApiError("Unauthorized", 401, "Unauthorized access.", true);

        const offset = (page - 1) * limit;
        const where = { isDeleted: false };
        if (farmId) where.farmId = farmId;
        if (status) where.status = status;

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

export const getInvoice = async (req, res, next) => {
    try {
        const { userId, query: { paymentId } } = req;
        const admin = await getUserById(userId, true);
        if (!admin) throw new ApiError("Unauthorized", 401, "Unauthorized access.", true);
        if (!paymentId) throw new ApiError("Invalid Details", 400, "paymentId is required.", true);

        const payment = await FarmPayment.findOne({
            where: { uuid: paymentId, isDeleted: false },
            include: [
                { model: Farms, as: "farm", attributes: ["uuid", "name", "location"] },
                { model: FarmSubscription, as: "subscription", attributes: ["uuid", "plan_name", "billing_cycle"], required: false },
            ],
        });
        if (!payment) throw new ApiError("Invalid Details", 400, "Payment not found.", true);

        return sendSuccessResponse(res, 200, true, "Invoice fetched successfully.", "invoice", { invoice: payment });
    } catch (error) {
        next(error);
    }
};
