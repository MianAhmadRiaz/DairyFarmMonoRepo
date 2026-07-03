import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import logger from "../logger/index.js";
import Animal from "./animal.js";

const AbortionEvent = sequelize.define("abortion_events", {
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
    milkable: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    comments: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    tableName: "abortion_events",
    timestamps: true,
});

AbortionEvent.belongsTo(Animal, { foreignKey: "animalId", as: "animal" });

(async () => {
    try {
        await AbortionEvent.sync({ alter: true });
        logger.info("AbortionEvent table created or updated successfully.");
    } catch (error) {
        logger.error("Error creating the AbortionEvent table:", error);
    }
})
// ();

export default AbortionEvent;
