import { DataTypes, Op } from "sequelize";
import sequelize from "../config/db.js";
import logger from "../logger/index.js";

const FinancialTransaction = sequelize.define("financial_transactions", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    transaction_number: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    transaction_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    transaction_type: {
        type: DataTypes.ENUM('income', 'expense', 'transfer', 'adjustment'),
        allowNull: false,
    },
    transaction_source: {
        type: DataTypes.ENUM('manual', 'feeding', 'animal_sale', 'milk_sale', 'salary', 'purchase', 'automated'),
        allowNull: false,
        defaultValue: 'manual'
    },
    reference_id: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    reference_type: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    debit_account_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "chart_of_accounts",
            key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
    },
    credit_account_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "chart_of_accounts",
            key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
    },
    amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
    },
    currency: {
        type: DataTypes.STRING(3),
        defaultValue: 'PKR',
        allowNull: false,
    },
    exchange_rate: {
        type: DataTypes.DECIMAL(10, 4),
        defaultValue: 1.0000,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('pending', 'completed', 'cancelled', 'reconciled'),
        allowNull: false,
        defaultValue: 'completed'
    },
    payment_method: {
        type: DataTypes.ENUM('cash', 'bank_transfer', 'cheque', 'credit_card', 'mobile_payment', 'other'),
        allowNull: true,
    },
    invoice_number: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    receipt_number: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    attachments: {
        type: DataTypes.JSON,
        allowNull: true
    },
    reconciliation_date: {
        type: DataTypes.DATE,
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
    },
    approvedBy: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: "users",
            key: "uuid",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
    },
    approved_at: {
        type: DataTypes.DATE,
        allowNull: true,
    }
}, {
    timestamps: true,
    indexes: [
        { fields: ['farmId'] },
        { fields: ['transaction_date'] },
        { fields: ['transaction_type'] },
        { fields: ['transaction_source'] },
        { fields: ['status'] },
        { fields: ['debit_account_id'] },
        { fields: ['credit_account_id'] },
        { fields: ['reference_id', 'reference_type'] }
    ]
});

// Generate transaction number
FinancialTransaction.generateTransactionNumber = async (farmId) => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    
    const prefix = `TXN-${year}${month}${day}`;
    
    const lastTransaction = await FinancialTransaction.findOne({
        where: {
            farmId: farmId,
            transaction_number: {
                [Op.like]: `${prefix}%`
            }
        },
        order: [['transaction_number', 'DESC']]
    });
    
    let sequence = 1;
    if (lastTransaction) {
        const lastSequence = parseInt(lastTransaction.transaction_number.split('-').pop());
        sequence = lastSequence + 1;
    }
    
    return `${prefix}-${String(sequence).padStart(4, '0')}`;
};

// Create automated transaction
FinancialTransaction.createAutomatedTransaction = async (transactionData, transaction) => {
    const transactionNumber = await FinancialTransaction.generateTransactionNumber(transactionData.farmId);
    
    return await FinancialTransaction.create({
        ...transactionData,
        transaction_number: transactionNumber,
        status: 'completed'
    }, { transaction });
};

// Sync the model
(async () => {
    try {
        await FinancialTransaction.sync({ alter: true });
        logger.info("FinancialTransaction table created or updated successfully.");
    } catch (error) {
        logger.error(`Error creating the FinancialTransaction table: ${error.message}`, error);
    }
})
// ();

export default FinancialTransaction;