import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import logger from "../logger/index.js";
import Animal from "./animal.js";

const DryOffEvent = sequelize.define("dry_off_events", {
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
    date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    category: {
        type: DataTypes.ENUM("remove", "add"),
        defaultValue: "add",
        allowNull: false,
    },
    reason: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
}, {
    tableName: "dry_off_events",
    timestamps: true,
});

DryOffEvent.belongsTo(Animal, { foreignKey: "animalId", as: "animal" });

(async () => {
    try {
        await DryOffEvent.sync({ alter: true });
        logger.info("DryOffEvent table created or updated successfully.");
    } catch (error) {
        logger.error("Error creating the DryOffEvent table:", error);
    }
})
// ();

export default DryOffEvent;
