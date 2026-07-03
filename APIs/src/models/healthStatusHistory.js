import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import logger from "../logger/index.js";
import Animal from "./animal.js";
import User from "./user.js";

const HealthStatusHistory = sequelize.define("health_status_history", {
    uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    animalId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: "animals",
            key: "uuid",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
    },
    healthStatus: {
        type: DataTypes.ENUM("sick", "milking", "culling"),
        allowNull: false,
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    createdBy: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: "users",
            key: "uuid",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
    },
}, {
    timestamps: true,
    tableName: "health_status_history",
});

HealthStatusHistory.belongsTo(Animal, { foreignKey: "animalId", as: "animal" });
HealthStatusHistory.belongsTo(User, { foreignKey: "createdBy", as: "created" });

(async () => {
    try {
        await HealthStatusHistory.sync({ alter: true });
        logger.info("HealthStatusHistory table created or updated successfully.");
    } catch (error) {
        logger.error("Error creating the healthStatusHistory table:", error);
    }
})
// ();

export default HealthStatusHistory;
