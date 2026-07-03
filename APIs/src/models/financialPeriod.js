import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import logger from "../logger/index.js";

const FinancialPeriod = sequelize.define("financial_periods", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    period_type: {
        type: DataTypes.ENUM('monthly', 'quarterly', 'yearly', 'custom'),
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
    status: {
        type: DataTypes.ENUM('open', 'closed', 'locked'),
        allowNull: false,
        defaultValue: 'open'
    },
    is_current: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    closed_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    locked_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    opening_balances_set: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    total_income: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00,
    },
    total_expenses: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00,
    },
    net_profit: {
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
    },
    closedBy: {
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
        { fields: ['farmId'] },
        { fields: ['period_type'] },
        { fields: ['status'] },
        { fields: ['start_date'] },
        { fields: ['end_date'] },
        { fields: ['is_current'] }
    ]
});

// Get current period for farm
FinancialPeriod.getCurrentPeriod = async (farmId) => {
    return await FinancialPeriod.findOne({
        where: {
            farmId: farmId,
            is_current: true,
            status: 'open'
        }
    });
};

// Create new financial period
FinancialPeriod.createNewPeriod = async (farmId, userId, periodType = 'monthly', startDate = null) => {
    const start = startDate ? new Date(startDate) : new Date();
    let end = new Date(start);
    let name;

    switch (periodType) {
        case 'monthly':
            end.setMonth(end.getMonth() + 1);
            end.setDate(0); // Last day of month
            name = `${start.toLocaleString('default', { month: 'long' })} ${start.getFullYear()}`;
            break;
        case 'quarterly': {
            const quarter = Math.floor(start.getMonth() / 3) + 1;
            end.setMonth((quarter * 3) - 1);
            end.setDate(new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate());
            name = `Q${quarter} ${start.getFullYear()}`;
            break;
        }
        case 'yearly':
            end.setFullYear(end.getFullYear() + 1);
            end.setMonth(0);
            end.setDate(0);
            name = `FY ${start.getFullYear()}`;
            break;
        default:
            throw new Error('Invalid period type');
    }

    // Close current period
    await FinancialPeriod.update(
        { is_current: false },
        { where: { farmId: farmId, is_current: true } }
    );

    return await FinancialPeriod.create({
        name,
        period_type: periodType,
        start_date: start.toISOString().split('T')[0],
        end_date: end.toISOString().split('T')[0],
        farmId,
        createdBy: userId,
        is_current: true
    });
};

// Close financial period
FinancialPeriod.closePeriod = async (periodId, userId) => {
    return await FinancialPeriod.update({
        status: 'closed',
        closed_at: new Date(),
        closedBy: userId,
        is_current: false
    }, {
        where: { id: periodId }
    });
};

// Calculate period totals
FinancialPeriod.calculatePeriodTotals = async (periodId) => {
    const period = await FinancialPeriod.findByPk(periodId);
    if (!period) throw new Error('Period not found');

    // This will be implemented once we have the transaction model relationships
    // For now, just update to show the method exists
    const totalIncome = 0; // Calculate from transactions
    const totalExpenses = 0; // Calculate from transactions
    const netProfit = totalIncome - totalExpenses;

    await period.update({
        total_income: totalIncome,
        total_expenses: totalExpenses,
        net_profit: netProfit
    });

    return period;
};

// Sync the model
(async () => {
    try {
        await FinancialPeriod.sync({ alter: true });
        logger.info("FinancialPeriod table created or updated successfully.");
    } catch (error) {
        logger.error(`Error creating the FinancialPeriod table: ${error.message}`, error);
    }
})
// ();

export default FinancialPeriod;