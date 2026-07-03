import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import logger from "../logger/index.js";
import Employee from "./employee.js";

const SalaryAdvance = sequelize.define("advance_salary", {
    uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    farmId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: "farms",
            key: "uuid",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
    },
    employee_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: "employees",
            key: "uuid",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
    },
    account: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    naration: {
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
    updatedBy: {
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
    tableName: "advance_salary",
});

SalaryAdvance.belongsTo(Employee, { foreignKey: "employee_id", as: "employee" });

(async () => {
    try {
        await SalaryAdvance.sync({ alter: true });
        logger.info("SalaryAdvance table created or updated successfully.");
    } catch (error) {
        logger.error("Error creating the SalaryAdvance table:", error);
    }
})
// ();

export default SalaryAdvance;
