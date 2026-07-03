import cron from "node-cron";
import { Op } from "sequelize";
import logger from "../logger/index.js";
import sendEmail from "../config/sendEmail.js";
import FarmSubscription from "../models/farmSubscription.js";
import Farms from "../models/farm.js";
import User from "../models/user.js";
import { toDateOnly } from "../utils/billing/billingUtils.js";
import { SubscriptionStatus } from "../constants/index.js";

// Returns a contact email for a farm (first non-deleted user), or null.
async function getFarmContactEmail(farmId) {
    try {
        const user = await User.findOne({
            where: { farmId, isDeleted: false },
            attributes: ["email", "firstname"],
            order: [["createdAt", "ASC"]],
            raw: true,
        });
        return user || null;
    } catch {
        return null;
    }
}

async function notify(farmId, subject, html) {
    try {
        const contact = await getFarmContactEmail(farmId);
        if (contact?.email) await sendEmail(contact.email, subject, html);
    } catch (error) {
        logger.error(`Billing reminder email failed for farm ${farmId}: ${error.message}`);
    }
}

async function subscriptionBillingJob() {
    try {
        const today = toDateOnly(new Date());

        // 1) Send "due soon" reminders for subscriptions due within the next 3 days.
        const soon = toDateOnly(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000));
        const dueSoon = await FarmSubscription.findAll({
            where: {
                isDeleted: false,
                status: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING],
                next_due_date: { [Op.between]: [today, soon] },
            },
            include: [{ model: Farms, as: "farm", attributes: ["uuid", "name"] }],
        });
        for (const sub of dueSoon) {
            await notify(
                sub.farmId,
                "Your CattleCare subscription payment is due soon",
                `<p>Dear ${sub.farm?.name || "Customer"},</p>
                 <p>Your subscription payment of <b>${sub.amount} ${sub.currency}</b> is due on <b>${sub.next_due_date}</b>.</p>
                 <p>Please ensure timely payment to avoid any interruption to your service.</p>`
            );
        }

        // 2) Move overdue active/trialing subscriptions to past_due.
        const overdue = await FarmSubscription.findAll({
            where: {
                isDeleted: false,
                status: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING],
                next_due_date: { [Op.lt]: today },
            },
            include: [{ model: Farms, as: "farm", attributes: ["uuid", "name"] }],
        });
        for (const sub of overdue) {
            await sub.update({ status: SubscriptionStatus.PAST_DUE });
            await notify(
                sub.farmId,
                "Your CattleCare subscription payment is overdue",
                `<p>Dear ${sub.farm?.name || "Customer"},</p>
                 <p>Your subscription payment of <b>${sub.amount} ${sub.currency}</b> was due on <b>${sub.next_due_date}</b> and is now overdue.</p>
                 <p>Please make the payment within your grace period of ${sub.grace_days} day(s) to avoid suspension.</p>`
            );
        }

        // 3) Suspend past_due subscriptions that are beyond their grace period.
        const pastDue = await FarmSubscription.findAll({
            where: { isDeleted: false, status: SubscriptionStatus.PAST_DUE, auto_suspend: true },
            include: [{ model: Farms, as: "farm", attributes: ["uuid", "name", "is_active"] }],
        });
        for (const sub of pastDue) {
            const deadline = new Date(sub.next_due_date);
            deadline.setDate(deadline.getDate() + (sub.grace_days || 0));
            if (toDateOnly(deadline) < today) {
                await sub.update({ status: SubscriptionStatus.SUSPENDED });
                if (sub.farm) {
                    await Farms.update({ is_active: false }, { where: { uuid: sub.farmId } });
                }
                await notify(
                    sub.farmId,
                    "Your CattleCare account has been suspended",
                    `<p>Dear ${sub.farm?.name || "Customer"},</p>
                     <p>Your account access has been suspended because the subscription payment remains unpaid beyond the grace period.</p>
                     <p>Please contact support or settle the outstanding amount to restore access.</p>`
                );
                logger.info(`Subscription ${sub.uuid} suspended for farm ${sub.farmId} (overdue beyond grace).`);
            }
        }
    } catch (error) {
        logger.error(`Subscription Billing Job :: ${error.message}`);
    }
}

let SubscriptionBillingJob;
try {
    // Runs every day at 02:00.
    SubscriptionBillingJob = cron.schedule("0 2 * * *", subscriptionBillingJob);
} catch (err) {
    logger.error(`Subscription Billing Job schedule :: ${err.message}`);
}

export { subscriptionBillingJob };
export default SubscriptionBillingJob;
