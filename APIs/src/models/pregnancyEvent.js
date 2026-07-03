import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import logger from "../logger/index.js";
import Animal from "./animal.js";

const PregnancyEvent = sequelize.define("pregnancy_events", {
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
    prev_test_date: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    breed_date: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    exp_dryoff_date: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    exp_calving_date: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    breed_with: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    result: {
        type: DataTypes.ENUM("positive", "negative"),
        allowNull: false,
    },
    tech: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    technique: {
        type: DataTypes.ENUM("by hand", "ultrasound"),
        allowNull: false,
    },
    cost: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    pg_days: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    recheck: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    tableName: "Pregnancy_events",
    timestamps: true,
});

PregnancyEvent.belongsTo(Animal, { foreignKey: "animalId", as: "animal" });

(async () => {
    try {
        await PregnancyEvent.sync({ alter: true });
        logger.info("PregnancyEvent table created or updated successfully.");
    } catch (error) {
        logger.error("Error creating the PregnancyEvent table:", error);
    }
})
// ();

export default PregnancyEvent;
