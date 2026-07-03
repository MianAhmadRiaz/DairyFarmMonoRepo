import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import logger from "../logger/index.js";

const FinancialSettings = sequelize.define("financial_settings", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    // Accounting Settings
    accounting_method: {
        type: DataTypes.ENUM('accrual', 'cash'),
        allowNull: false,
        defaultValue: 'accrual'
    },
    fiscal_year_start_month: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1, // January
        validate: {
            min: 1,
            max: 12
        }
    },
    default_currency: {
        type: DataTypes.STRING(3),
        allowNull: false,
        defaultValue: 'PKR'
    },
    currency_symbol: {
        type: DataTypes.STRING(5),
        allowNull: false,
        defaultValue: 'Rs.'
    },
    decimal_places: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 2,
        validate: {
            min: 0,
            max: 4
        }
    },
    
    // Default Account IDs
    default_cash_account_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "chart_of_accounts",
            key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
    },
    default_bank_account_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "chart_of_accounts",
            key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
    },
    default_sales_account_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "chart_of_accounts",
            key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
    },
    default_purchase_account_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "chart_of_accounts",
            key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
    },
    default_expense_account_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "chart_of_accounts",
            key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
    },
    
    // Automation Settings
    auto_create_journal_entries: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    auto_post_transactions: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    auto_generate_milk_sales: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    auto_generate_feed_expenses: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    auto_generate_salary_expenses: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    
    // Report Settings
    profit_loss_grouping: {
        type: DataTypes.ENUM('account_type', 'category', 'detailed'),
        defaultValue: 'category'
    },
    balance_sheet_format: {
        type: DataTypes.ENUM('standard', 'comparative', 'detailed'),
        defaultValue: 'standard'
    },
    show_zero_balances: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    
    // Tax Settings
    tax_enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    default_tax_rate: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0.00
    },
    tax_account_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "chart_of_accounts",
            key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
    },
    
    // Budget Settings
    budget_alerts_enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    budget_variance_threshold: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 10.00 // 10% variance threshold
    },
    
    // Backup & Archive Settings
    auto_backup_enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    backup_frequency: {
        type: DataTypes.ENUM('daily', 'weekly', 'monthly'),
        defaultValue: 'weekly'
    },
    archive_old_periods: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    archive_after_months: {
        type: DataTypes.INTEGER,
        defaultValue: 24
    },
    
    farmId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        references: {
            model: "farms",
            key: "uuid",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
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
    }
}, {
    timestamps: true,
    indexes: [
        { fields: ['farmId'], unique: true }
    ]
});

// Create default settings for new farm
FinancialSettings.createDefaultSettings = async (farmId, userId) => {
    return await FinancialSettings.create({
        farmId: farmId,
        updatedBy: userId,
        // All other fields will use their default values
    });
};

// Get settings for farm
FinancialSettings.getSettingsForFarm = async (farmId) => {
    let settings = await FinancialSettings.findOne({
        where: { farmId: farmId }
    });
    
    if (!settings) {
        // Create default settings if they don't exist
        settings = await FinancialSettings.createDefaultSettings(farmId, null);
    }
    
    return settings;
};

// Update default accounts after chart of accounts creation
FinancialSettings.updateDefaultAccounts = async (farmId, accountMappings) => {
    const settings = await FinancialSettings.getSettingsForFarm(farmId);
    
    const updates = {};
    if (accountMappings.cash_account_id) updates.default_cash_account_id = accountMappings.cash_account_id;
    if (accountMappings.bank_account_id) updates.default_bank_account_id = accountMappings.bank_account_id;
    if (accountMappings.sales_account_id) updates.default_sales_account_id = accountMappings.sales_account_id;
    if (accountMappings.purchase_account_id) updates.default_purchase_account_id = accountMappings.purchase_account_id;
    if (accountMappings.expense_account_id) updates.default_expense_account_id = accountMappings.expense_account_id;
    if (accountMappings.tax_account_id) updates.tax_account_id = accountMappings.tax_account_id;
    
    if (Object.keys(updates).length > 0) {
        await settings.update(updates);
    }
    
    return settings;
};

// Get accounting preferences
FinancialSettings.getAccountingPreferences = async (farmId) => {
    const settings = await FinancialSettings.getSettingsForFarm(farmId);
    
    return {
        accounting_method: settings.accounting_method,
        fiscal_year_start_month: settings.fiscal_year_start_month,
        default_currency: settings.default_currency,
        currency_symbol: settings.currency_symbol,
        decimal_places: settings.decimal_places,
        auto_create_journal_entries: settings.auto_create_journal_entries,
        auto_post_transactions: settings.auto_post_transactions
    };
};

// Get automation settings
FinancialSettings.getAutomationSettings = async (farmId) => {
    const settings = await FinancialSettings.getSettingsForFarm(farmId);
    
    return {
        auto_generate_milk_sales: settings.auto_generate_milk_sales,
        auto_generate_feed_expenses: settings.auto_generate_feed_expenses,
        auto_generate_salary_expenses: settings.auto_generate_salary_expenses,
        auto_create_journal_entries: settings.auto_create_journal_entries,
        auto_post_transactions: settings.auto_post_transactions
    };
};

// Get default accounts
FinancialSettings.getDefaultAccounts = async (farmId) => {
    const settings = await FinancialSettings.getSettingsForFarm(farmId);
    
    return {
        cash_account_id: settings.default_cash_account_id,
        bank_account_id: settings.default_bank_account_id,
        sales_account_id: settings.default_sales_account_id,
        purchase_account_id: settings.default_purchase_account_id,
        expense_account_id: settings.default_expense_account_id,
        tax_account_id: settings.tax_account_id
    };
};

// Validate settings before save
FinancialSettings.beforeUpdate(async (settings) => {
    // Validate fiscal year start month
    if (settings.fiscal_year_start_month < 1 || settings.fiscal_year_start_month > 12) {
        throw new Error('Fiscal year start month must be between 1 and 12');
    }
    
    // Validate decimal places
    if (settings.decimal_places < 0 || settings.decimal_places > 4) {
        throw new Error('Decimal places must be between 0 and 4');
    }
    
    // Validate tax rate
    if (settings.default_tax_rate < 0 || settings.default_tax_rate > 100) {
        throw new Error('Tax rate must be between 0 and 100');
    }
    
    // Validate budget variance threshold
    if (settings.budget_variance_threshold < 0 || settings.budget_variance_threshold > 100) {
        throw new Error('Budget variance threshold must be between 0 and 100');
    }
});

// Sync the model
(async () => {
    try {
        await FinancialSettings.sync({ alter: true });
        logger.info("FinancialSettings table created or updated successfully.");
    } catch (error) {
        logger.error(`Error creating the FinancialSettings table: ${error.message}`, error);
    }
})
// ();

export default FinancialSettings;