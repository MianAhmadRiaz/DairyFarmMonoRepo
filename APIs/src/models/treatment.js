import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Animal from "./animal.js";
import StockItems from "./stockItem.js";

// Health / treatment records with milk & meat withdrawal tracking.
// milkWithdrawalUntil / meatWithdrawalUntil are computed at write time so the
// milk module can cheaply block milk from animals still under withdrawal.
const Treatment = sequelize.define("animal_treatments", {
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
        onDelete: "CASCADE",
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    treatmentType: {
        type: DataTypes.ENUM("treatment", "vaccination", "deworming", "hoof trimming", "vet visit", "other"),
        allowNull: false,
        defaultValue: "treatment",
    },
    diagnosis: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    medicineName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    medicineStockItemId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: "stock_items",
            key: "uuid",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
    },
    quantityUsed: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    dosage: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    vetName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    cost: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 0,
    },
    milkWithdrawalDays: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    meatWithdrawalDays: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    milkWithdrawalUntil: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    meatWithdrawalUntil: {
        type: DataTypes.DATEONLY,
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
        onDelete: "SET NULL",
    },
    isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    timestamps: true,
    tableName: "animal_treatments",
});

Treatment.belongsTo(Animal, { foreignKey: "animalId", as: "animal" });
Animal.hasMany(Treatment, { foreignKey: "animalId", as: "treatments" });
Treatment.belongsTo(StockItems, { foreignKey: "medicineStockItemId", as: "medicineItem" });

export default Treatment;
