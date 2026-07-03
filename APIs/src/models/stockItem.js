import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import logger from "../logger/index.js";
import StockLevel from "./stockLevel.js";
import UnitsOfMeasure from "./unitsOfMeasures.js";
import StockCategories from "./stockCategories.js";

const StockItems = sequelize.define("stock_items", {
    uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING(200),
        allowNull: true,
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
    category_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    sub_categoryId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: "medicine_categories",
            key: "uuid",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
    },
    sub_category_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    unit_of_measure: {
        type: DataTypes.STRING(30),
        allowNull: false,
    },
    unitId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: "units_of_measures",
            key: "uuid",
        },
        onUpdate: "SET NULL",
        onDelete: "SET NULL",
    },
    reorder_level: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
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
        tableName: "stock_items",
        defaultScope: {
            where: {
                isDeleted: false,
            },
        },
    }
);

StockItems.hasOne(StockLevel, { foreignKey: "itemId", as: "stockLevel" });
StockLevel.belongsTo(StockItems, { foreignKey: "itemId", as: "item" });
StockItems.belongsTo(UnitsOfMeasure, { foreignKey: "unitId", as: "unit" });
StockItems.belongsTo(StockCategories, { foreignKey: "categoryId", as: "category" });

(async () => {
    try {
        await StockItems.sync({ alter: true });
        logger.info("StockItems table created or updated successfully.");
    } catch (error) {
        logger.error("Error creating the StockItems table:", error);
    }
})
// ();

export default StockItems;
