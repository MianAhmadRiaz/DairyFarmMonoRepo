import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import logger from "../logger/index.js";

const ChartOfAccounts = sequelize.define("chart_of_accounts", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    account_code: {
        type: DataTypes.STRING(20),
        allowNull: false,
    },
    account_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    account_type: {
        type: DataTypes.ENUM('asset', 'liability', 'equity', 'revenue', 'expense'),
        allowNull: false,
    },
    account_subtype: {
        type: DataTypes.ENUM(
            // Assets
            'current_asset', 'fixed_asset', 'other_asset',
            // Liabilities  
            'current_liability', 'long_term_liability',
            // Equity
            'owner_equity', 'retained_earnings',
            // Revenue
            'operating_revenue', 'other_revenue',
            // Expenses
            'cost_of_goods_sold', 'operating_expense', 'other_expense'
        ),
        allowNull: false,
    },
    parent_account_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "chart_of_accounts",
            key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    is_system_account: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    opening_balance: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00,
    },
    current_balance: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00,
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
        { fields: ['account_code'] },
        { fields: ['account_type'] },
        { fields: ['is_active'] }
    ]
});

// Self-referencing association for parent accounts
ChartOfAccounts.belongsTo(ChartOfAccounts, { 
    as: 'parentAccount', 
    foreignKey: 'parent_account_id' 
});
ChartOfAccounts.hasMany(ChartOfAccounts, { 
    as: 'subAccounts', 
    foreignKey: 'parent_account_id' 
});

// Create default chart of accounts for a farm
ChartOfAccounts.createDefaultAccounts = async (farmId, userId, transaction) => {
    const defaultAccounts = [
        // ASSETS
        { code: '1000', name: 'ASSETS', type: 'asset', subtype: 'current_asset', parent: null },
        { code: '1100', name: 'Current Assets', type: 'asset', subtype: 'current_asset', parent: '1000' },
        { code: '1110', name: 'Cash on Hand', type: 'asset', subtype: 'current_asset', parent: '1100' },
        { code: '1120', name: 'Bank Accounts', type: 'asset', subtype: 'current_asset', parent: '1100' },
        { code: '1130', name: 'Feed Inventory', type: 'asset', subtype: 'current_asset', parent: '1100' },
        { code: '1140', name: 'Medicine Inventory', type: 'asset', subtype: 'current_asset', parent: '1100' },
        { code: '1150', name: 'Other Inventory', type: 'asset', subtype: 'current_asset', parent: '1100' },
        { code: '1160', name: 'Employee Advances', type: 'asset', subtype: 'current_asset', parent: '1100' },
        
        { code: '1200', name: 'Fixed Assets', type: 'asset', subtype: 'fixed_asset', parent: '1000' },
        { code: '1210', name: 'Livestock', type: 'asset', subtype: 'fixed_asset', parent: '1200' },
        { code: '1220', name: 'Buildings & Structures', type: 'asset', subtype: 'fixed_asset', parent: '1200' },
        { code: '1230', name: 'Machinery & Equipment', type: 'asset', subtype: 'fixed_asset', parent: '1200' },
        { code: '1240', name: 'Vehicles', type: 'asset', subtype: 'fixed_asset', parent: '1200' },
        
        // LIABILITIES
        { code: '2000', name: 'LIABILITIES', type: 'liability', subtype: 'current_liability', parent: null },
        { code: '2100', name: 'Current Liabilities', type: 'liability', subtype: 'current_liability', parent: '2000' },
        { code: '2110', name: 'Accounts Payable', type: 'liability', subtype: 'current_liability', parent: '2100' },
        { code: '2120', name: 'Wages Payable', type: 'liability', subtype: 'current_liability', parent: '2100' },
        { code: '2130', name: 'Short-term Loans', type: 'liability', subtype: 'current_liability', parent: '2100' },
        
        { code: '2200', name: 'Long-term Liabilities', type: 'liability', subtype: 'long_term_liability', parent: '2000' },
        { code: '2210', name: 'Equipment Loans', type: 'liability', subtype: 'long_term_liability', parent: '2200' },
        { code: '2220', name: 'Property Mortgages', type: 'liability', subtype: 'long_term_liability', parent: '2200' },
        
        // EQUITY
        { code: '3000', name: 'EQUITY', type: 'equity', subtype: 'owner_equity', parent: null },
        { code: '3100', name: 'Owner\'s Capital', type: 'equity', subtype: 'owner_equity', parent: '3000' },
        { code: '3200', name: 'Retained Earnings', type: 'equity', subtype: 'retained_earnings', parent: '3000' },
        
        // REVENUE
        { code: '4000', name: 'REVENUE', type: 'revenue', subtype: 'operating_revenue', parent: null },
        { code: '4100', name: 'Milk Sales', type: 'revenue', subtype: 'operating_revenue', parent: '4000' },
        { code: '4200', name: 'Livestock Sales', type: 'revenue', subtype: 'operating_revenue', parent: '4000' },
        { code: '4300', name: 'Breeding Services', type: 'revenue', subtype: 'operating_revenue', parent: '4000' },
        { code: '4400', name: 'By-product Sales', type: 'revenue', subtype: 'operating_revenue', parent: '4000' },
        { code: '4500', name: 'Other Income', type: 'revenue', subtype: 'other_revenue', parent: '4000' },
        
        // EXPENSES
        { code: '5000', name: 'EXPENSES', type: 'expense', subtype: 'operating_expense', parent: null },
        { code: '5100', name: 'Feed Costs', type: 'expense', subtype: 'cost_of_goods_sold', parent: '5000' },
        { code: '5200', name: 'Veterinary Expenses', type: 'expense', subtype: 'operating_expense', parent: '5000' },
        { code: '5300', name: 'Labor Costs', type: 'expense', subtype: 'operating_expense', parent: '5000' },
        { code: '5400', name: 'Equipment & Machinery', type: 'expense', subtype: 'operating_expense', parent: '5000' },
        { code: '5500', name: 'Utilities', type: 'expense', subtype: 'operating_expense', parent: '5000' },
        { code: '5600', name: 'Maintenance & Repairs', type: 'expense', subtype: 'operating_expense', parent: '5000' },
        { code: '5700', name: 'Operating Expenses', type: 'expense', subtype: 'operating_expense', parent: '5000' },
    ];

    const accountMap = {};
    
    for (const account of defaultAccounts) {
        const parentId = account.parent ? accountMap[account.parent] : null;
        
        const created = await ChartOfAccounts.create({
            account_code: account.code,
            account_name: account.name,
            account_type: account.type,
            account_subtype: account.subtype,
            parent_account_id: parentId,
            is_system_account: true,
            farmId: farmId,
            createdBy: userId
        }, { transaction });
        
        accountMap[account.code] = created.id;
    }
    
    return accountMap;
};

// Sync the model
(async () => {
    try {
        await ChartOfAccounts.sync({ alter: true });
        logger.info("ChartOfAccounts table created or updated successfully.");
    } catch (error) {
        logger.error(`Error creating the ChartOfAccounts table: ${error.message}`, error);
    }
})
// ();

export default ChartOfAccounts;