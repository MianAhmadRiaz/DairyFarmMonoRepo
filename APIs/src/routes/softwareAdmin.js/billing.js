import express from "express";

import systemAdminCheckPermission from "../../middlewares/systemAdminCheckPermission.js";
import { SystemAdminPermissions } from "../../constants/index.js";

import { createPlan, getPlans, updatePlan, deletePlan } from "../../controllers/softwareAdmin/billing/plans.controller.js";
import {
    assignSubscription, getSubscriptions, getSubscriptionByFarm, updateSubscription,
    suspendSubscription, reactivateSubscription, cancelSubscription,
    extendSubscription, trueUpSubscription,
} from "../../controllers/softwareAdmin/billing/subscriptions.controller.js";
import { recordPayment, getPayments, getInvoice } from "../../controllers/softwareAdmin/billing/payments.controller.js";
import { getFarmFeatureFlags, setFarmFeatureFlag } from "../../controllers/softwareAdmin/billing/featureFlags.controller.js";
import { getBillingOverview } from "../../controllers/softwareAdmin/billing/overview.controller.js";
import { getRevenueDashboard, getAllPayments } from "../../controllers/softwareAdmin/billing/revenue.controller.js";
import { getAuditLogs } from "../../controllers/softwareAdmin/billing/auditLogs.controller.js";

const router = express.Router();

const canView = systemAdminCheckPermission(SystemAdminPermissions.viewBilling);
const canManage = systemAdminCheckPermission(SystemAdminPermissions.manageBilling);
const canViewRevenue = systemAdminCheckPermission(SystemAdminPermissions.viewRevenue);

// Dashboard
router.get("/overview", canView, getBillingOverview);

// Revenue / finance dashboard for the software owner
router.get("/revenue", canViewRevenue, getRevenueDashboard);
router.get("/revenue/payments", canViewRevenue, getAllPayments);

// Plans
router.get("/plans", canView, getPlans);
router.post("/plans", canManage, createPlan);
router.put("/plans", canManage, updatePlan);
router.delete("/plans", canManage, deletePlan);

// Subscriptions
router.get("/subscriptions", canView, getSubscriptions);
router.get("/subscriptions/by-farm", canView, getSubscriptionByFarm);
router.post("/subscriptions", canManage, assignSubscription);
router.put("/subscriptions", canManage, updateSubscription);
router.put("/subscriptions/suspend", canManage, suspendSubscription);
router.put("/subscriptions/reactivate", canManage, reactivateSubscription);
router.put("/subscriptions/cancel", canManage, cancelSubscription);
router.put("/subscriptions/extend", canManage, extendSubscription);
router.put("/subscriptions/true-up", canManage, trueUpSubscription);

// Payments & invoices
router.get("/payments", canView, getPayments);
router.post("/payments", canManage, recordPayment);
router.get("/payments/invoice", canView, getInvoice);

// Per-farm feature toggles
router.get("/feature-flags", canView, getFarmFeatureFlags);
router.put("/feature-flags", canManage, setFarmFeatureFlag);

// Audit log
router.get("/audit-logs", canView, getAuditLogs);

export default router;
