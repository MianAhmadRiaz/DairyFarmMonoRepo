import { DataTypes, Op } from "sequelize";
import sequelize from "../config/db.js";
import logger from "../logger/index.js";
import ChartOfAccounts from "./chartOfAccounts.js";
import AccountBalance from "./accountBalance.js";

const JournalEntry = sequelize.define("journal_entries", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    entry_number: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    entry_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    entry_type: {
        type: DataTypes.ENUM('standard', 'adjusting', 'closing', 'reversing'),
        allowNull: false,
        defaultValue: 'standard'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    reference: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    total_debit: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
    },
    total_credit: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('draft', 'posted', 'reversed'),
        allowNull: false,
        defaultValue: 'draft'
    },
    posted_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    reversed_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    reversal_entry_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "journal_entries",
            key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
    },
    period_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "financial_periods",
            key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
    },
    transaction_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "financial_transactions",
            key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
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
    postedBy: {
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
        { fields: ['entry_date'] },
        { fields: ['entry_type'] },
        { fields: ['status'] },
        { fields: ['period_id'] },
        { fields: ['transaction_id'] }
    ]
});

// Journal Entry Line Items
const JournalEntryLineItem = sequelize.define("journal_entry_line_items", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    journal_entry_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "journal_entries",
            key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
    },
    account_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "chart_of_accounts",
            key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    debit_amount: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00,
    },
    credit_amount: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00,
    },
    line_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    }
}, {
    timestamps: true,
    indexes: [
        { fields: ['journal_entry_id'] },
        { fields: ['account_id'] }
    ]
});

// Generate journal entry number
JournalEntry.generateEntryNumber = async (farmId) => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    
    const prefix = `JE-${year}${month}`;
    
    const lastEntry = await JournalEntry.findOne({
        where: {
            farmId: farmId,
            entry_number: {
                [Op.like]: `${prefix}%`
            }
        },
        order: [['entry_number', 'DESC']]
    });
    
    let sequence = 1;
    if (lastEntry) {
        const lastSequence = parseInt(lastEntry.entry_number.split('-').pop());
        sequence = lastSequence + 1;
    }
    
    return `${prefix}-${String(sequence).padStart(4, '0')}`;
};

// Create journal entry with line items
JournalEntry.createWithLineItems = async (entryData, lineItems, transaction) => {
    const entryNumber = await JournalEntry.generateEntryNumber(entryData.farmId);
    
    // Calculate totals
    const totalDebit = lineItems.reduce((sum, item) => sum + (parseFloat(item.debit_amount) || 0), 0);
    const totalCredit = lineItems.reduce((sum, item) => sum + (parseFloat(item.credit_amount) || 0), 0);
    
    // Validate that debits equal credits
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
        throw new Error('Journal entry debits must equal credits');
    }
    
    const entry = await JournalEntry.create({
        ...entryData,
        entry_number: entryNumber,
        total_debit: totalDebit,
        total_credit: totalCredit
    }, { transaction });
    
    // Create line items
    const lineItemsWithOrder = lineItems.map((item, index) => ({
        ...item,
        journal_entry_id: entry.id,
        line_order: index + 1
    }));
    
    await JournalEntryLineItem.bulkCreate(lineItemsWithOrder, { transaction });
    
    return entry;
};

// Post journal entry — flips status AND applies each line item to the account
// running balances and per-period balances, atomically.
JournalEntry.postEntry = async (entryId, userId) => {
    const entry = await JournalEntry.findByPk(entryId, {
        include: [{ model: JournalEntryLineItem, as: 'lineItems' }]
    });

    if (!entry) throw new Error('Journal entry not found');
    if (entry.status !== 'draft') throw new Error('Only draft entries can be posted');

    const t = await sequelize.transaction();
    try {
        const debitNormal = new Set(['asset', 'expense']);
        for (const line of entry.lineItems || []) {
            const account = await ChartOfAccounts.findOne({
                where: { id: line.account_id, farmId: entry.farmId },
                transaction: t,
            });
            if (!account) throw new Error(`Line item account ${line.account_id} does not belong to this farm`);
            const debit = Number(line.debit_amount) || 0;
            const credit = Number(line.credit_amount) || 0;
            const delta = debitNormal.has(account.account_type) ? (debit - credit) : (credit - debit);
            await account.update(
                { current_balance: Number(account.current_balance) + delta },
                { transaction: t }
            );
            if (entry.period_id) {
                await AccountBalance.updateBalance(line.account_id, entry.period_id, debit, credit, entry.entry_date, entry.farmId, t);
            }
        }

        await entry.update({
            status: 'posted',
            posted_at: new Date(),
            postedBy: userId
        }, { transaction: t });

        await t.commit();
    } catch (error) {
        await t.rollback();
        throw error;
    }

    return entry;
};

// Reverse journal entry
JournalEntry.reverseEntry = async (entryId, userId, reversalReason) => {
    const originalEntry = await JournalEntry.findByPk(entryId, {
        include: [{ model: JournalEntryLineItem, as: 'lineItems' }]
    });
    
    if (!originalEntry) throw new Error('Journal entry not found');
    if (originalEntry.status !== 'posted') throw new Error('Only posted entries can be reversed');
    
    // Create reversal entry
    const reversalLineItems = originalEntry.lineItems.map(item => ({
        account_id: item.account_id,
        description: `Reversal of ${item.description}`,
        debit_amount: item.credit_amount,
        credit_amount: item.debit_amount
    }));
    
    const reversalEntry = await JournalEntry.createWithLineItems({
        entry_date: new Date().toISOString().split('T')[0],
        entry_type: 'reversing',
        description: `Reversal of ${originalEntry.entry_number}: ${reversalReason}`,
        reference: originalEntry.entry_number,
        period_id: originalEntry.period_id,
        farmId: originalEntry.farmId,
        createdBy: userId
    }, reversalLineItems);
    
    // Update original entry
    await originalEntry.update({
        status: 'reversed',
        reversed_at: new Date(),
        reversal_entry_id: reversalEntry.id
    });
    
    // Post the reversal entry immediately
    await JournalEntry.postEntry(reversalEntry.id, userId);
    
    return reversalEntry;
};

// Define associations
JournalEntry.hasMany(JournalEntryLineItem, { 
    foreignKey: 'journal_entry_id', 
    as: 'lineItems',
    onDelete: 'CASCADE'
});
JournalEntryLineItem.belongsTo(JournalEntry, { 
    foreignKey: 'journal_entry_id', 
    as: 'journalEntry'
});

// Sync the models
(async () => {
    try {
        await JournalEntry.sync({ alter: true });
        await JournalEntryLineItem.sync({ alter: true });
        logger.info("JournalEntry and JournalEntryLineItem tables created or updated successfully.");
    } catch (error) {
        logger.error(`Error creating the JournalEntry tables: ${error.message}`, error);
    }
})
// ();

export { JournalEntry, JournalEntryLineItem };
export default JournalEntry;