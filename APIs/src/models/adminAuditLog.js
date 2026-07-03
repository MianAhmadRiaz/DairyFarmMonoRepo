import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

// Audit trail of actions performed by software administrators.
const AdminAuditLog = sequelize.define("admin_audit_logs", {
    uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    adminId: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    admin_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    // e.g. "plan.create", "subscription.suspend", "farm.block", "payment.record"
    action: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    // e.g. "farm", "plan", "subscription", "payment", "feature_flag"
    entity_type: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    entity_id: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    metadata: {
        type: DataTypes.JSONB,
        allowNull: true,
    },
    ip_address: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    timestamps: true,
    tableName: "admin_audit_logs",
});

export default AdminAuditLog;
