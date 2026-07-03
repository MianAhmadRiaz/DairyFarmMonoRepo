import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import logger from "../logger/index.js";
import Employee from "./employee.js";

const SalaryInvoice = sequelize.define("salary_invoices", {
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
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    expense_head: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    month: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    leave_allowance: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 1,
    },
    base_salary: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
    },
    gross_salary: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
    },
    opening_advance: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
    },
    total_days: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 30,
    },
    present_days: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
    },
    absence_days: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
    },
    salary_days: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
    },
    deduction: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
    },
    bonus: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
    },
    overtime: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
    },
    status: {
        type: DataTypes.ENUM(["unpaid", "paid"]),
        allowNull: true,
        defaultValue: "unpaid",
    },
    paid_at: {
        type: DataTypes.DATE,
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
    advance_deduction_skipped: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Whether advance deduction was skipped for this salary month'
    },
}, {
    timestamps: true,
    tableName: "salary_invoices",
});

SalaryInvoice.belongsTo(Employee, { foreignKey: "employee_id", as: "employee" });

(async () => {
    try {
        await SalaryInvoice.sync({ alter: true });
        logger.info("SalaryInvoice table created or updated successfully.");
    } catch (error) {
        logger.error("Error creating the SalaryInvoice table:", error);
    }
})
// ();

export default SalaryInvoice;
