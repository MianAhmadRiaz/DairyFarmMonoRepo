import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import logger from "../logger/index.js";

const Farms = sequelize.define("farms", {
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
    status: {
        type: DataTypes.ENUM(["PENDING", "REJECTED", "APPROVED"]),
        allowNull: true,
        defaultValue: "PENDING",
    },
    status_updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    location: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    time_zone: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
    },
    // Hard revoke by the software admin — independent of subscription state.
    // A revoked farm cannot access anything regardless of is_active/subscription.
    is_revoked: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    revoked_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    revoke_reason: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    // Per-farm discount applied to subscription billing.
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
    discount_note: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    isBlocked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    timestamps: true,
    tableName: "farms",
});

(async () => {
    try {
        await Farms.sync({ alter: true });
        logger.info("Farms table created or updated successfully.");
    } catch (error) {
        logger.error("Error creating the Farms table:", error);
    }
})
// ();

export default Farms;
