import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import logger from "../logger/index.js";
import Animal from "./animal.js";

const HeatEvents = sequelize.define("heat_events", {
    uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    farmId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: "farms",
            key: "uuid",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
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
    date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    reason: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    comments: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    tableName: "heat_events",
    timestamps: true,
});

HeatEvents.belongsTo(Animal, { foreignKey: "animalId", as: "animal" });

(async () => {
    try {
        await HeatEvents.sync({ alter: true });
        logger.info("HeatEvents table created or updated successfully.");
    } catch (error) {
        logger.error("Error creating the HeatEvents table:", error);
    }
})
// ();

export default HeatEvents;
