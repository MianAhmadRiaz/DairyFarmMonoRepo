import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import logger from "../logger/index.js";

const HeatDetectionReasons = sequelize.define("heat_detection_reasons", {
    uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    farmId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: "farms",
            key: "uuid",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    default: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    timestamps: true,
    tableName: "heat_detection_reasons",
});

(async () => {
    try {
        await HeatDetectionReasons.sync({ alter: true });
        logger.info("HeatDetectionReasons table created or updated successfully.");
    } catch (error) {
        logger.error("Error creating the HeatDetectionReasons table:", error);
    }
})
// ();

export default HeatDetectionReasons;
