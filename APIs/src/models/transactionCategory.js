import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import logger from "../logger/index.js";

const TransactionCategory = sequelize.define("transaction_categories", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    code: {
        type: DataTypes.STRING(20),
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    category_type: {
        type: DataTypes.ENUM('income', 'expense'),
        allowNull: false,
    },
    parent_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "transaction_categories",
            key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    icon: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    color: {
        type: DataTypes.STRING(7),
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
    createdBy: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: "users",
            key: "uuid",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
    }
}, {
    timestamps: true,
    indexes: [
        { fields: ['farmId'] },
        { fields: ['category_type'] },
        { fields: ['is_active'] },
        { fields: ['code', 'farmId'], unique: true }
    ]
});

// Create default categories for new farm
TransactionCategory.createDefaultCategories = async (farmId, userId, transaction) => {
    const defaultCategories = [
        // Income Categories
        { name: "Milk Sales", code: "MILK_SALE", category_type: "income", icon: "🥛", color: "#4CAF50" },
        { name: "Animal Sales", code: "ANIMAL_SALE", category_type: "income", icon: "🐄", color: "#8BC34A" },
        { name: "Breeding Services", code: "BREEDING", category_type: "income", icon: "🐂", color: "#CDDC39" },
        { name: "Other Income", code: "OTHER_INC", category_type: "income", icon: "💰", color: "#FFC107" },
        
        // Expense Categories
        { name: "Feed & Nutrition", code: "FEED", category_type: "expense", icon: "🌾", color: "#FF9800" },
        { name: "Veterinary & Medicine", code: "VET", category_type: "expense", icon: "💊", color: "#F44336" },
        { name: "Employee Salaries", code: "SALARY", category_type: "expense", icon: "👥", color: "#9C27B0" },
        { name: "Utilities", code: "UTILITY", category_type: "expense", icon: "⚡", color: "#2196F3" },
        { name: "Equipment & Machinery", code: "EQUIPMENT", category_type: "expense", icon: "🔧", color: "#607D8B" },
        { name: "Building & Infrastructure", code: "BUILDING", category_type: "expense", icon: "🏗️", color: "#795548" },
        { name: "Transportation", code: "TRANSPORT", category_type: "expense", icon: "🚛", color: "#009688" },
        { name: "Insurance", code: "INSURANCE", category_type: "expense", icon: "🛡️", color: "#3F51B5" },
        { name: "Professional Services", code: "SERVICES", category_type: "expense", icon: "📋", color: "#E91E63" },
        { name: "Other Expenses", code: "OTHER_EXP", category_type: "expense", icon: "💸", color: "#FF5722" }
    ];

    const categories = [];
    for (const category of defaultCategories) {
        categories.push({
            ...category,
            farmId,
            createdBy: userId,
            description: `Default ${category.name.toLowerCase()} category`
        });
    }

    return await TransactionCategory.bulkCreate(categories, { transaction });
};

// Sync the model
(async () => {
    try {
        await TransactionCategory.sync({ alter: true });
        logger.info("TransactionCategory table created or updated successfully.");
    } catch (error) {
        logger.error(`Error creating the TransactionCategory table: ${error.message}`, error);
    }
})
// ();

export default TransactionCategory;