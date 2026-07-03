import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import logger from "../logger/index.js";
import { TransactionTypes } from "../constants/index.js";
import StockItems from "./stockItem.js";

const StockTransactions = sequelize.define("stock_transactions", {
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
    item_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    note: {
        type: DataTypes.STRING(300),
        allowNull: true,
    },
    last_quantity: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0,
    },
    quantity: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0,
    },
    reference: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    transaction_type: {
        type: DataTypes.ENUM(Object.values(TransactionTypes)),
        allowNull: false,
    },
    price: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        defaultValue: 0,
    },
    is_adjustment: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    createdBy: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: "users",
            key: "uuid",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
    },
    updatedBy: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: "users",
            key: "uuid",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
    },
    isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
},
    {
        timestamps: true,
        paranoid: true,
        tableName: "stock_transactions",
    }
);

StockTransactions.belongsTo(StockItems, { foreignKey: "itemId", as: "item" });

(async () => {
    try {
        await StockTransactions.sync({ alter: true });
        logger.info("StockTransactions table created or updated successfully.");
    } catch (error) {
        logger.error("Error creating the StockTransactions table:", error);
    }
})
// ();

export default StockTransactions;
