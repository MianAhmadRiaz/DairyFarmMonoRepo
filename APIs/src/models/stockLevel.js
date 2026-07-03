import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import logger from "../logger/index.js";

const StockLevel = sequelize.define("stock_level", {
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
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
    },
    item_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    quantity: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 1,
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
        tableName: "stock_level",
    }
);

(async () => {
    try {
        await StockLevel.sync({ alter: true });
        logger.info("StockLevel table created or updated successfully.");
    } catch (error) {
        logger.error("Error creating the StockLevel table:", error);
    }
})
// ();

export default StockLevel;
