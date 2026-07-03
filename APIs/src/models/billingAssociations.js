// Centralised associations for the farm billing / subscription module.
// Imported from models/index.js after all billing models are loaded.
import Farms from "./farm.js";
import SubscriptionPlan from "./subscriptionPlan.js";
import FarmSubscription from "./farmSubscription.js";
import FarmPayment from "./farmPayment.js";
import FarmFeatureFlag from "./farmFeatureFlag.js";

// Subscription <-> Plan
SubscriptionPlan.hasMany(FarmSubscription, { foreignKey: "planId", as: "subscriptions" });
FarmSubscription.belongsTo(SubscriptionPlan, { foreignKey: "planId", as: "plan" });

// Farm <-> Subscription
Farms.hasMany(FarmSubscription, { foreignKey: "farmId", as: "subscriptions" });
FarmSubscription.belongsTo(Farms, { foreignKey: "farmId", as: "farm" });

// Farm <-> Payment
Farms.hasMany(FarmPayment, { foreignKey: "farmId", as: "payments" });
FarmPayment.belongsTo(Farms, { foreignKey: "farmId", as: "farm" });

// Subscription <-> Payment
FarmSubscription.hasMany(FarmPayment, { foreignKey: "subscriptionId", as: "payments" });
FarmPayment.belongsTo(FarmSubscription, { foreignKey: "subscriptionId", as: "subscription" });

// Farm <-> Feature flags
Farms.hasMany(FarmFeatureFlag, { foreignKey: "farmId", as: "featureFlags" });
FarmFeatureFlag.belongsTo(Farms, { foreignKey: "farmId", as: "farm" });

export { SubscriptionPlan, FarmSubscription, FarmPayment, FarmFeatureFlag };
