import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import logger from "../logger/index.js";
import Animal from "./animal.js";

const aiBreedingEvent = sequelize.define("ai_breeding_events", {
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
    time: {
        type: DataTypes.TIME,
        allowNull: true,
    },
    semen: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    tech: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    type: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    cost: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    weight: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    dose: {
        type: DataTypes.INTEGER,
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
    tableName: "ai_breeding_events",
    timestamps: true,
});

aiBreedingEvent.belongsTo(Animal, { foreignKey: "animalId", as: "animal" });

(async () => {
    try {
        await aiBreedingEvent.sync({ alter: true });
        logger.info("aiBreedingEvent table created or updated successfully.");
    } catch (error) {
        logger.error("Error creating the aiBreedingEvent table:", error);
    }
})
// ();

export default aiBreedingEvent;
