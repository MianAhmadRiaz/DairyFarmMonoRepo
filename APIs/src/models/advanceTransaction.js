import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Employee from "./employee.js";
import User from "./user.js";
import logger from "../logger/index.js";

const AdvanceTransaction = sequelize.define("AdvanceTransaction", {
    uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
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
    employee_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: "employees",
            key: "uuid",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
    },
    transaction_type: {
        type: DataTypes.ENUM('given', 'received'),
        allowNull: false,
    },
    amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        validate: {
            min: 0.01
        }
    },
    transaction_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    reference_number: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Bank transaction ref, receipt number, etc.'
    },
    payment_method: {
        type: DataTypes.ENUM('cash', 'bank_transfer', 'cheque', 'mobile_payment', 'other'),
        allowNull: false,
        defaultValue: 'cash'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Reason for advance or payment details'
    },
    deduct_from_salary: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Whether this advance should be deducted from monthly salary'
    },
    deduction_start_month: {
        type: DataTypes.STRING, // Format: YYYY-MM
        allowNull: true,
        comment: 'Month from which to start deducting (if deduct_from_salary is true)'
    },
    monthly_deduction_amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        comment: 'Amount to deduct per month (for installment deductions)'
    },
    status: {
        type: DataTypes.ENUM('active', 'fully_recovered', 'written_off'),
        allowNull: false,
        defaultValue: 'active',
    },
    // Finance module integration fields
    expense_category: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Employee Advance',
        comment: 'For finance module categorization'
    },
    financial_year: {
        type: DataTypes.STRING, // Format: YYYY-YYYY (e.g., 2025-2026)
        allowNull: false,
        comment: 'Financial year for reporting'
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
    tableName: "advance_transactions",
    indexes: [
        {
            fields: ['farmId', 'employee_id']
        },
        {
            fields: ['transaction_type', 'status']
        },
        {
            fields: ['transaction_date']
        },
        {
            fields: ['financial_year']
        }
    ]
});

// Associations
AdvanceTransaction.belongsTo(Employee, { foreignKey: "employee_id", as: "employee" });
AdvanceTransaction.belongsTo(User, { foreignKey: "createdBy", as: "creator" });
AdvanceTransaction.belongsTo(User, { foreignKey: "updatedBy", as: "updater" });

// Model sync - Fixed ENUM syntax
(async () => {
    try {
        // Drop and recreate the table to avoid ENUM conflicts
        await AdvanceTransaction.sync({ force: true });
        logger.info("AdvanceTransaction table created successfully.");
    } catch (error) {
        logger.error("Error creating the AdvanceTransaction table:", error);
    }
})
// ();

export default AdvanceTransaction;