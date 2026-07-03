import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import logger from "../logger/index.js";
import StockItems from "./stockItem.js";

const Snapshots = sequelize.define("snapshots", {
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
    categoryId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: "stock_categories",
            key: "uuid",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
    },
    quantity: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0,
    },
    avg_price: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0,
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
},
    {
        timestamps: true,
        paranoid: true,
        tableName: "snapshots",
    }
);

Snapshots.belongsTo(StockItems, { foreignKey: "itemId", as: "item" });

(async () => {
    try {
        await Snapshots.sync({ alter: true });
        logger.info("Snapshots table created or updated successfully.");
    } catch (error) {
        logger.error("Error creating the Snapshots table:", error);
    }
})
// ();

export default Snapshots;
