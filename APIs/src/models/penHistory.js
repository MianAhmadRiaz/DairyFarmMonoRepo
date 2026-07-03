import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import logger from "../logger/index.js";
import Pen from "./pen.js";
import Animal from "./animal.js";

const PenHistory = sequelize.define("pen_history", {
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
    newPenId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: "pen",
            key: "uuid",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
    },
    oldPenId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: "pen",
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
        type: DataTypes.STRING(100),
        allowNull: true,
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
    tableName: "pen_history",
});

PenHistory.belongsTo(Pen, { foreignKey: "oldPenId", as: "oldPen" });
PenHistory.belongsTo(Pen, { foreignKey: "newPenId", as: "newPen" });
PenHistory.belongsTo(Animal, { foreignKey: "animalId", as: "animal" });

(async () => {
    try {
        await PenHistory.sync({ alter: true });
        logger.info("PenHistory table created or updated successfully.");
    } catch (error) {
        logger.error("Error creating the penHistory table:", error);
    }
})
// ();

export default PenHistory;
