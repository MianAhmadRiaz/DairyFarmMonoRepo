import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import logger from "../logger/index.js";
import Animal from "./animal.js";
import Bull from "./bull.js";

const BullBreedingEvent = sequelize.define("bull_breeding_events", {
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
    bullId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: "bulls",
            key: "uuid",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    double_dose: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    comments: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    tableName: "bull_breeding_events",
    timestamps: true,
});

BullBreedingEvent.belongsTo(Animal, { foreignKey: "animalId", as: "animal" });
BullBreedingEvent.belongsTo(Bull, { foreignKey: "bullId", as: "bull" });

(async () => {
    try {
        await BullBreedingEvent.sync({ alter: true });
        logger.info("BullBreedingEvent table created or updated successfully.");
    } catch (error) {
        logger.error("Error creating the BullBreedingEvent table:", error);
    }
})
// ();

export default BullBreedingEvent;
