import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import logger from "../logger/index.js";

const Budget = sequelize.define("budgets", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    budget_type: {
        type: DataTypes.ENUM('income', 'expense', 'capital'),
        allowNull: false,
    },
    period_type: {
        type: DataTypes.ENUM('monthly', 'quarterly', 'yearly'),
        allowNull: false,
    },
    start_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    end_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    budgeted_amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
    },
    actual_amount: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00,
    },
    variance: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00,
    },
    variance_percentage: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0.00,
    },
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "transaction_categories",
            key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
    },
    account_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "chart_of_accounts",
            key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
    },
    status: {
        type: DataTypes.ENUM('draft', 'active', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'draft'
    },
    is_recurring: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    recurring_frequency: {
        type: DataTypes.ENUM('monthly', 'quarterly', 'yearly'),
        allowNull: true,
    },
    alert_threshold: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 80.00
    },
    alert_enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    notes: {
        type: DataTypes.TEXT,
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
        { fields: ['budget_type'] },
        { fields: ['status'] },
        { fields: ['start_date'] },
        { fields: ['end_date'] },
        { fields: ['category_id'] },
        { fields: ['account_id'] }
    ]
});

// Update budget actuals
Budget.updateActuals = async (budgetId) => {
    const budget = await Budget.findByPk(budgetId);
    if (!budget) throw new Error('Budget not found');

    // This will be implemented once we have transaction relationships
    // For now, just show the method structure
    const actualAmount = 0; // Calculate from transactions
    const variance = actualAmount - budget.budgeted_amount;
    const variancePercentage = budget.budgeted_amount > 0 
        ? (variance / budget.budgeted_amount) * 100 
        : 0;

    await budget.update({
        actual_amount: actualAmount,
        variance: variance,
        variance_percentage: variancePercentage
    });

    return budget;
};

// Create annual budget breakdown
Budget.createAnnualBudget = async (farmId, userId, year, budgetData) => {
    const budgets = [];
    
    for (const data of budgetData) {
        const monthlyAmount = data.annual_amount / 12;
        
        for (let month = 0; month < 12; month++) {
            const startDate = new Date(year, month, 1);
            const endDate = new Date(year, month + 1, 0);
            
            budgets.push({
                name: `${data.name} - ${startDate.toLocaleString('default', { month: 'long' })} ${year}`,
                budget_type: data.budget_type,
                period_type: 'monthly',
                start_date: startDate.toISOString().split('T')[0],
                end_date: endDate.toISOString().split('T')[0],
                budgeted_amount: monthlyAmount,
                category_id: data.category_id,
                account_id: data.account_id,
                status: 'active',
                farmId,
                createdBy: userId
            });
        }
    }
    
    return await Budget.bulkCreate(budgets);
};

// Get budget alerts
Budget.getBudgetAlerts = async (farmId) => {
    const budgets = await Budget.findAll({
        where: {
            farmId: farmId,
            status: 'active',
            alert_enabled: true
        }
    });

    const alerts = [];
    for (const budget of budgets) {
        const usagePercentage = budget.budgeted_amount > 0 
            ? (budget.actual_amount / budget.budgeted_amount) * 100 
            : 0;

        if (usagePercentage >= budget.alert_threshold) {
            alerts.push({
                budget_id: budget.id,
                budget_name: budget.name,
                usage_percentage: usagePercentage,
                threshold: budget.alert_threshold,
                budgeted_amount: budget.budgeted_amount,
                actual_amount: budget.actual_amount,
                variance: budget.variance
            });
        }
    }

    return alerts;
};

// Sync the model
(async () => {
    try {
        await Budget.sync({ alter: true });
        logger.info("Budget table created or updated successfully.");
    } catch (error) {
        logger.error(`Error creating the Budget table: ${error.message}`, error);
    }
})
// ();

export default Budget;