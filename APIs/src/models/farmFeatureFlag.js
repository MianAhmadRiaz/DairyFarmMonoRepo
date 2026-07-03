import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

// Per-farm enable/disable switch for individual application modules.
// A missing row for a (farmId, module_key) pair is treated as enabled.
const FarmFeatureFlag = sequelize.define("farm_feature_flags", {
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
    module_key: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    is_enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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
    tableName: "farm_feature_flags",
    indexes: [
        { unique: true, fields: ["farmId", "module_key"] },
    ],
});

export default FarmFeatureFlag;
