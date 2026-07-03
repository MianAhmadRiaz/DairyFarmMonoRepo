import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const SubscriptionPlan = sequelize.define("subscription_plans", {
    uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    price: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
    },
    currency: {
        type: DataTypes.STRING(8),
        allowNull: false,
        defaultValue: "USD",
    },
    billing_cycle: {
        type: DataTypes.ENUM("monthly", "quarterly", "half_yearly", "yearly"),
        allowNull: false,
        defaultValue: "monthly",
    },
    // How the charge is computed:
    //   flat        -> use `price` for the whole billing cycle
    //   per_animal  -> use `per_animal_rate` * farm's animal count (snapshotted at renewal)
    pricing_model: {
        type: DataTypes.ENUM("flat", "per_animal"),
        allowNull: false,
        defaultValue: "flat",
    },
    // Rate charged per animal per billing cycle (used when pricing_model = per_animal).
    per_animal_rate: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
    },
    // Marks this as a trial-style plan (e.g. the 3-month free trial).
    is_trial_plan: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    // Per-plan resource limits (null = unlimited)
    max_animals: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    max_employees: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    // List of module keys included in this plan e.g. ["herd","milking","stock"]
    features: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
    },
    trial_days: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    createdBy: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    updatedBy: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    timestamps: true,
    tableName: "subscription_plans",
});

export default SubscriptionPlan;
