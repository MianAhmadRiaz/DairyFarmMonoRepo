import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import logger from "../logger/index.js";
import Tag from "./tag.js";

const TagHistory = sequelize.define("tag_history", {
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
    newTagId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: "tag",
            key: "uuid",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
    },
    oldTagId: {
        type: DataTypes.UUID,
        allowNull: false,
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
    tableName: "tag_history",
});

TagHistory.belongsTo(Tag, { foreignKey: "oldTagId", as: "oldTag" });
TagHistory.belongsTo(Tag, { foreignKey: "newTagId", as: "newTag" });

(async () => {
    try {
        await TagHistory.sync({ alter: true });
        logger.info("TagHistory table created or updated successfully.");
    } catch (error) {
        logger.error("Error creating the tagHistory table:", error);
    }
})
// ();

export default TagHistory;
