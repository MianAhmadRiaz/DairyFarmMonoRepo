import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import logger from "../logger/index.js";

const AccountBalance = sequelize.define("account_balances", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    account_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "chart_of_accounts",
            key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
    },
    period_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "financial_periods",
            key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
    },
    opening_balance: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00,
    },
    total_debits: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00,
    },
    total_credits: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00,
    },
    closing_balance: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00,
    },
    balance_type: {
        type: DataTypes.ENUM('debit', 'credit'),
        allowNull: false,
    },
    last_transaction_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    last_updated: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
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
    }
}, {
    timestamps: true,
    indexes: [
        { fields: ['account_id', 'period_id'], unique: true },
        { fields: ['farmId'] },
        { fields: ['period_id'] },
        { fields: ['last_transaction_date'] }
    ]
});

// Calculate closing balance based on account type
AccountBalance.calculateClosingBalance = function(accountType, openingBalance, totalDebits, totalCredits) {
    let closingBalance;
    let balanceType;
    
    switch (accountType) {
        case 'asset':
        case 'expense':
            // Debit increases, Credit decreases
            closingBalance = openingBalance + totalDebits - totalCredits;
            balanceType = closingBalance >= 0 ? 'debit' : 'credit';
            break;
        case 'liability':
        case 'equity':
        case 'revenue':
            // Credit increases, Debit decreases
            closingBalance = openingBalance + totalCredits - totalDebits;
            balanceType = closingBalance >= 0 ? 'credit' : 'debit';
            break;
        default:
            throw new Error(`Unknown account type: ${accountType}`);
    }
    
    return {
        closing_balance: Math.abs(closingBalance),
        balance_type: balanceType
    };
};

// Update account balance after transaction
AccountBalance.updateBalance = async (accountId, periodId, debitAmount = 0, creditAmount = 0, transactionDate, farmId, transaction = null) => {
    let balance = await AccountBalance.findOne({
        where: { account_id: accountId, period_id: periodId },
        transaction
    });
    
    if (!balance) {
        // Get account type from chart of accounts
        const ChartOfAccounts = (await import('./chartOfAccounts.js')).default;
        const account = await ChartOfAccounts.findByPk(accountId, { transaction });
        if (!account) throw new Error('Account not found');

        const defaultBalanceType = ['asset', 'expense'].includes(account.account_type) ? 'debit' : 'credit';
        balance = await AccountBalance.create({
            account_id: accountId,
            period_id: periodId,
            farmId: farmId,
            total_debits: 0,
            total_credits: 0,
            opening_balance: 0,
            closing_balance: 0,
            balance_type: defaultBalanceType
        }, { transaction });
    }
    
    // Update totals
    const newTotalDebits = parseFloat(balance.total_debits) + parseFloat(debitAmount);
    const newTotalCredits = parseFloat(balance.total_credits) + parseFloat(creditAmount);
    
    // Get account for balance calculation
    const ChartOfAccounts = (await import('./chartOfAccounts.js')).default;
    const account = await ChartOfAccounts.findByPk(accountId, { transaction });
    
    const { closing_balance, balance_type } = AccountBalance.calculateClosingBalance(
        account.account_type,
        parseFloat(balance.opening_balance),
        newTotalDebits,
        newTotalCredits
    );
    
    await balance.update({
        total_debits: newTotalDebits,
        total_credits: newTotalCredits,
        closing_balance: closing_balance,
        balance_type: balance_type,
        last_transaction_date: transactionDate,
        last_updated: new Date()
    }, { transaction });
    
    return balance;
};

// Get trial balance for a period
AccountBalance.getTrialBalance = async (periodId, farmId) => {
    const balances = await AccountBalance.findAll({
        where: { period_id: periodId, farmId: farmId },
        include: [{
            model: (await import('./chartOfAccounts.js')).default,
            as: 'account',
            attributes: ['account_code', 'account_name', 'account_type']
        }],
        order: [['account', 'account_code']]
    });
    
    let totalDebits = 0;
    let totalCredits = 0;
    
    const trialBalance = balances.map(balance => {
        const debitBalance = balance.balance_type === 'debit' ? balance.closing_balance : 0;
        const creditBalance = balance.balance_type === 'credit' ? balance.closing_balance : 0;
        
        totalDebits += parseFloat(debitBalance);
        totalCredits += parseFloat(creditBalance);
        
        return {
            account_code: balance.account.account_code,
            account_name: balance.account.account_name,
            account_type: balance.account.account_type,
            debit_balance: debitBalance,
            credit_balance: creditBalance
        };
    });
    
    return {
        trial_balance: trialBalance,
        total_debits: totalDebits,
        total_credits: totalCredits,
        is_balanced: Math.abs(totalDebits - totalCredits) < 0.01
    };
};

// Initialize balances for new period
AccountBalance.initializePeriodBalances = async (newPeriodId, previousPeriodId, farmId) => {
    if (previousPeriodId) {
        // Copy closing balances from previous period as opening balances
        const previousBalances = await AccountBalance.findAll({
            where: { period_id: previousPeriodId, farmId: farmId }
        });
        
        const newBalances = previousBalances.map(prevBalance => ({
            account_id: prevBalance.account_id,
            period_id: newPeriodId,
            opening_balance: prevBalance.closing_balance,
            total_debits: 0,
            total_credits: 0,
            closing_balance: prevBalance.closing_balance,
            balance_type: prevBalance.balance_type,
            farmId: farmId
        }));
        
        return await AccountBalance.bulkCreate(newBalances);
    } else {
        // First period - initialize with zero balances for all accounts
        const ChartOfAccounts = (await import('./chartOfAccounts.js')).default;
        const accounts = await ChartOfAccounts.findAll({
            where: { farmId: farmId, is_active: true }
        });
        
        const initialBalances = accounts.map(account => ({
            account_id: account.id,
            period_id: newPeriodId,
            opening_balance: 0,
            total_debits: 0,
            total_credits: 0,
            closing_balance: 0,
            balance_type: ['asset', 'expense'].includes(account.account_type) ? 'debit' : 'credit',
            farmId: farmId
        }));
        
        return await AccountBalance.bulkCreate(initialBalances);
    }
};

// Get account balance summary
AccountBalance.getAccountSummary = async (accountId, periodId) => {
    const balance = await AccountBalance.findOne({
        where: { account_id: accountId, period_id: periodId },
        include: [{
            model: (await import('./chartOfAccounts.js')).default,
            as: 'account',
            attributes: ['account_code', 'account_name', 'account_type']
        }]
    });
    
    if (!balance) return null;
    
    return {
        account: balance.account,
        opening_balance: balance.opening_balance,
        total_debits: balance.total_debits,
        total_credits: balance.total_credits,
        closing_balance: balance.closing_balance,
        balance_type: balance.balance_type,
        last_transaction_date: balance.last_transaction_date
    };
};

// Sync the model
(async () => {
    try {
        await AccountBalance.sync({ alter: true });
        logger.info("AccountBalance table created or updated successfully.");
    } catch (error) {
        logger.error(`Error creating the AccountBalance table: ${error.message}`, error);
    }
})
// ();

export default AccountBalance;