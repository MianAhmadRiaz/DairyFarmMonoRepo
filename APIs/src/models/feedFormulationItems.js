import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import logger from "../logger/index.js";
import StockItems from "./stockItem.js";

const FeedFormulationsItems = sequelize.define("feed_formulations_items", {
    uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    formulation_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    quantity: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
    },
    formulationId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: "feed_formulations",
            key: "uuid",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
    },
    itemId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: "stock_items",
            key: "uuid",
        },
        onUpdate: "SET NULL",
        onDelete: "SET NULL",
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
    isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
},
    {
        timestamps: true,
        paranoid: true,
        tableName: "feed_formulations_items",
    }
);

FeedFormulationsItems.belongsTo(StockItems, { foreignKey: "itemId", targetKey: "uuid", as: "stockItem" });

(async () => {
    try {
        await FeedFormulationsItems.sync({ alter: true });
        logger.info("FeedFormulationsItems table created or updated successfully.");
    } catch (error) {
        logger.error("Error creating the FeedFormulationsItems table:", error);
    }
})
// ();

export default FeedFormulationsItems;
