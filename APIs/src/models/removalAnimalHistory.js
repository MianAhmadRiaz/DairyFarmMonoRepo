import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import logger from "../logger/index.js";
import Tag from "./tag.js";
import Animal from "./animal.js";

const AnimalRemovalHistory = sequelize.define("animal_removal_history", {
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
    oldTagId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: "tag",
            key: "uuid",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    removalCategory: {
        type: DataTypes.ENUM("mortality", "sold", "slaughter"),
        defaultValue: "sold",
        allowNull: false,
    },
    removalReason: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    salePrice: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    comments: {
        type: DataTypes.STRING,
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
    tableName: "animal_removal_history",
});

AnimalRemovalHistory.belongsTo(Tag, { foreignKey: "oldTagId", as: "oldTag" });
AnimalRemovalHistory.belongsTo(Animal, { foreignKey: "animalId", as: "animal" });

(async () => {
    try {
        await AnimalRemovalHistory.sync({ alter: true });
        logger.info("AnimalRemovalHistory table created or updated successfully.");
    } catch (error) {
        logger.error("Error creating the animalRemovalHistory table:", error);
    }
})
// ();

export default AnimalRemovalHistory;
