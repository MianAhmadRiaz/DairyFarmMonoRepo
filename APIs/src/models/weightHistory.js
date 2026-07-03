import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import logger from "../logger/index.js";
import Animal from "./animal.js";
import User from "./user.js";

const WeightHistory = sequelize.define("weight_history", {
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
    weight: {
        type: DataTypes.FLOAT,
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
    tableName: "weight_history",
});

WeightHistory.belongsTo(Animal, { foreignKey: "animalId", as: "animal" });
WeightHistory.belongsTo(User, { foreignKey: "createdBy", as: "created" });

(async () => {
    try {
        await WeightHistory.sync({ alter: true });
        logger.info("WeightHistory table created or updated successfully.");
    } catch (error) {
        logger.error("Error creating the weightHistory table:", error);
    }
})
// ();

export default WeightHistory;
