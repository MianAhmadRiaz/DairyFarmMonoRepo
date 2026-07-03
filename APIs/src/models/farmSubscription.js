import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const FarmSubscription = sequelize.define("farm_subscriptions", {
    uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    farmId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "farms", key: "uuid" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
    },
    planId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "subscription_plans", key: "uuid" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
    },
    // Snapshot of plan details at the time of assignment
    plan_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    amount: {
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
    // Snapshot of the pricing model + per-animal details for this subscription.
    pricing_model: {
        type: DataTypes.ENUM("flat", "per_animal"),
        allowNull: false,
        defaultValue: "flat",
    },
    per_animal_rate: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
    },
    // Animal count captured at the last assignment/renewal — the count this
    // period's `amount` was billed for.
    billed_animal_count: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    // Discount snapshot applied to this subscription's amount.
    discount_type: {
        type: DataTypes.ENUM("none", "percentage", "flat"),
        allowNull: false,
        defaultValue: "none",
    },
    discount_value: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
    },
    // Gross (pre-discount) amount, for transparency on invoices.
    gross_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
    },
    status: {
        type: DataTypes.ENUM("trialing", "active", "past_due", "suspended", "cancelled"),
        allowNull: false,
        defaultValue: "active",
    },
    start_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    current_period_start: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    // Date the next payment is due. Used by the auto-suspend job.
    next_due_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    // Days after next_due_date before the farm is auto-suspended.
    grace_days: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 7,
    },
    auto_suspend: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    cancelled_at: {
        type: DataTypes.DATE,
        allowNull: true,
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
    tableName: "farm_subscriptions",
});

export default FarmSubscription;
