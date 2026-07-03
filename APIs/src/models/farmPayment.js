import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const FarmPayment = sequelize.define("farm_payments", {
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
    subscriptionId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "farm_subscriptions", key: "uuid" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
    },
    invoice_number: {
        type: DataTypes.STRING,
        allowNull: false,
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
    status: {
        type: DataTypes.ENUM("paid", "pending", "failed", "refunded"),
        allowNull: false,
        defaultValue: "paid",
    },
    method: {
        type: DataTypes.ENUM("cash", "bank_transfer", "cheque", "card", "mobile_payment", "other"),
        allowNull: false,
        defaultValue: "bank_transfer",
    },
    payment_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    // Billing period this payment covers
    period_start: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    period_end: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    reference: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    recordedBy: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    timestamps: true,
    tableName: "farm_payments",
});

export default FarmPayment;
