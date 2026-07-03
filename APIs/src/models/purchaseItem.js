import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import logger from "../logger/index.js";

const PurchaseItems = sequelize.define("purchase_items", {
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
    supplierId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: "suppliers",
            key: "uuid",
        },
        onUpdate: "SET NULL",
        onDelete: "SET NULL",
    },
    supplier_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
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
    quantity: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
    },
    cost_per_unit: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
    },
    total_cost: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    batch_number: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    expiry_date: {
        type: DataTypes.DATEONLY,
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
        tableName: "purchase_items",
        defaultScope: {
            where: {
                isDeleted: false,
            },
        },
    }
);

(async () => {
    try {
        await PurchaseItems.sync({ alter: true });
        logger.info("PurchaseItems table created or updated successfully.");
    } catch (error) {
        logger.error("Error creating the PurchaseItems table:", error);
    }
})
// ();

export default PurchaseItems;
