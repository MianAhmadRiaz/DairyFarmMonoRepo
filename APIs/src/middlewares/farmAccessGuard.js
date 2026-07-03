import { Op } from "sequelize";
import { ApiError } from "../utils/ApiError.js";
import { getUserById } from "../repo/user.js";
import Farms from "../models/farm.js";
import FarmSubscription from "../models/farmSubscription.js";
import FarmFeatureFlag from "../models/farmFeatureFlag.js";
import { SubscriptionStatus } from "../constants/index.js";

// Maps the first path segment of a farm API route to a feature-flag module key.
// Requests to unmapped segments are not feature-gated.
const ROUTE_MODULE_MAP = {
    animal: "herd",
    bull: "herd",
    tag: "herd",
    pen: "herd",
    events: "herd",
    "breeding-events": "breeding",
    protocol: "breeding",
    treatments: "herd",
    milk: "milking",
    "milk-categories": "milking",
    feeding: "feeding",
    "feed-formulation": "feeding",
    "stock-items": "stock",
    "stock-categories": "stock",
    "stock-transactions": "stock",
    "stock-reports": "stock",
    "purchase-items": "stock",
    suppliers: "stock",
    "medicine-categories": "stock",
    employees: "employee",
    attendance: "employee",
    salary: "employee",
    departments: "employee",
    designations: "employee",
    tasks: "employee",
    finance: "finance",
};

// Lightweight in-memory cache of farm access state (5s TTL) so we don't hit
// the DB on every single request for the same farm.
const cache = new Map();
const TTL_MS = 5000;

async function loadFarmState(farmId) {
    const cached = cache.get(farmId);
    if (cached && cached.expires > Date.now()) return cached.state;

    const [farm, subscription] = await Promise.all([
        Farms.findOne({ where: { uuid: farmId }, raw: true }),
        FarmSubscription.findOne({
            where: { farmId, isDeleted: false },
            order: [["createdAt", "DESC"]],
            raw: true,
        }),
    ]);
    const state = { farm, subscription };
    cache.set(farmId, { state, expires: Date.now() + TTL_MS });
    return state;
}

// Invalidate the cache when the admin changes a farm's state (called by admin controllers).
export function invalidateFarmAccessCache(farmId) {
    cache.delete(farmId);
}

/**
 * Enforces, on every farm request, that the farm may currently use the system:
 *  - not revoked / blocked / deleted
 *  - is_active
 *  - has a live (non-suspended/cancelled) subscription
 *  - the module for this route is enabled via feature flags
 */
const farmAccessGuard = async (req, res, next) => {
    try {
        const user = await getUserById(req.userId);
        if (!user) throw new ApiError("Unauthorized", 401, "Unauthorized access.", true);
        // First-login: block everything until the temporary password is changed.
        if (user.must_reset_password) {
            throw new ApiError("Password Reset Required", 403, "You must set a new password before continuing.", true);
        }
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 401, "Farm not found.", true);
        req.farmId = farmId; // make available to downstream handlers

        const { farm, subscription } = await loadFarmState(farmId);
        if (!farm || farm.isDeleted) throw new ApiError("Forbidden", 403, "This farm no longer exists.", true);
        if (farm.is_revoked) throw new ApiError("Forbidden", 403, farm.revoke_reason ? `Farm access revoked: ${farm.revoke_reason}` : "Farm access has been revoked by the administrator.", true);
        if (farm.isBlocked) throw new ApiError("Forbidden", 403, "This farm has been blocked. Please contact support.", true);
        if (farm.is_active === false) throw new ApiError("Payment Required", 402, "Farm access is inactive. Your subscription may have lapsed — please contact support.", true);

        if (subscription) {
            if ([SubscriptionStatus.SUSPENDED, SubscriptionStatus.CANCELLED].includes(subscription.status)) {
                throw new ApiError("Payment Required", 402, `Your subscription is ${subscription.status}. Please renew to continue.`, true);
            }
        }

        // Feature-flag enforcement for the route's module.
        const segment = req.baseUrl.split("/").filter(Boolean).pop(); // e.g. "animal"
        const moduleKey = ROUTE_MODULE_MAP[segment];
        if (moduleKey) {
            const flag = await FarmFeatureFlag.findOne({
                where: { farmId, module_key: moduleKey },
                raw: true,
            });
            // Missing row = enabled by default; only an explicit is_enabled=false blocks.
            if (flag && flag.is_enabled === false) {
                throw new ApiError("Forbidden", 403, `The ${moduleKey} module is disabled for your farm. Contact your administrator.`, true);
            }
        }

        next();
    } catch (error) {
        next(error);
    }
};

export default farmAccessGuard;
