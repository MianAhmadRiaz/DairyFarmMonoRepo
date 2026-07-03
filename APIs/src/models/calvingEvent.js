import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import logger from "../logger/index.js";
import Animal from "./animal.js";

const CalvingEvent = sequelize.define("calving_events", {
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
    penId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: "pen",
            key: "uuid",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
    },
    cost: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    time: {
        type: DataTypes.TIME,
        allowNull: true,
    },
    calving_ease: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    lactation: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    problems: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    comments: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    tableName: "calving_events",
    timestamps: true,
});

CalvingEvent.belongsTo(Animal, { foreignKey: "animalId", as: "animal" });

(async () => {
    try {
        await CalvingEvent.sync({ alter: true });
        logger.info("CalvingEvent table created or updated successfully.");
    } catch (error) {
        logger.error("Error creating the CalvingEvent table:", error);
    }
})
// ();

export default CalvingEvent;
