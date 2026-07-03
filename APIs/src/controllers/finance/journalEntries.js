import { Op } from "sequelize";
import { JournalEntry, JournalEntryLineItem } from "../../models/journalEntry.js";
import ChartOfAccounts from "../../models/chartOfAccounts.js";
import FinancialPeriod from "../../models/financialPeriod.js";
import { getFarmContext, ensureFinanceSetup } from "../../repo/finance.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";

const lineItemInclude = [
    {
        model: JournalEntryLineItem,
        as: "lineItems",
        include: [{ model: ChartOfAccounts, as: "account", attributes: ["id", "account_code", "account_name", "account_type"] }],
    },
];

// GET /finance/journal-entries
export const GetJournalEntries = async (req, res, next) => {
    try {
        const { query: { limit = 20, page = 1, status, entryType, startDate, endDate }, userId } = req;
        const offset = (page - 1) * limit;
        const { farmId } = await getFarmContext(userId);
        await ensureFinanceSetup(farmId, userId);

        const where = { farmId };
        if (status) where.status = status;
        if (entryType) where.entry_type = entryType;
        if (startDate && endDate) where.entry_date = { [Op.between]: [startDate, endDate] };

        const { count, rows: items } = await JournalEntry.findAndCountAll({
            where,
            include: lineItemInclude,
            offset: Number(offset),
            limit: Number(limit),
            order: [["entry_date", "DESC"], ["createdAt", "DESC"]],
            distinct: true,
        });
        const totalPages = Math.ceil(count / limit);
        return sendSuccessResponse(res, 200, true, "Journal entries fetched successfully.", "journal-entries", {
            items,
            page: Number(page),
            totalPages: Number(totalPages),
            limit: Number(limit),
            skip: offset,
            totalCount: Number(count),
        });
    } catch (error) {
        next(error);
    }
};

// GET /finance/journal-entries/:id
export const GetJournalEntryById = async (req, res, next) => {
    try {
        const { params: { id }, userId } = req;
        const { farmId } = await getFarmContext(userId);
        const entry = await JournalEntry.findOne({ where: { id, farmId }, include: lineItemInclude });
        if (!entry) throw new ApiError("Not found", 404, "Journal entry not found", true);
        return sendSuccessResponse(res, 200, true, "Journal entry fetched successfully.", "journal-entries", entry);
    } catch (error) {
        next(error);
    }
};

// POST /finance/journal-entries
export const CreateJournalEntry = async (req, res, next) => {
    try {
        const { body, userId } = req;
        const { farmId } = await getFarmContext(userId);
        await ensureFinanceSetup(farmId, userId);

        const { entry_date, entry_type, description, lineItems } = body;
        if (!Array.isArray(lineItems) || lineItems.length < 2) {
            throw new ApiError("Validation error", 400, "At least two line items are required", true);
        }
        // Every line-item account must belong to the caller's farm.
        const accountIds = [...new Set(lineItems.map((li) => li.account_id))];
        const ownedCount = await ChartOfAccounts.count({ where: { id: { [Op.in]: accountIds }, farmId } });
        if (ownedCount !== accountIds.length) {
            throw new ApiError("Validation error", 400, "One or more line-item accounts do not belong to this farm", true);
        }
        const period = await FinancialPeriod.getCurrentPeriod(farmId);
        const entry = await JournalEntry.createWithLineItems(
            {
                entry_date: entry_date ? new Date(entry_date) : new Date(),
                entry_type: entry_type || "standard",
                description: description || "Manual journal entry",
                period_id: period ? period.id : null,
                farmId,
                createdBy: userId,
                status: "draft",
            },
            lineItems.map((li, idx) => ({
                account_id: li.account_id,
                debit_amount: li.debit_amount || 0,
                credit_amount: li.credit_amount || 0,
                description: li.description || null,
                line_order: idx + 1,
            }))
        );
        return sendSuccessResponse(res, 201, true, "Journal entry created successfully.", "journal-entries", entry);
    } catch (error) {
        next(error);
    }
};

// PATCH /finance/journal-entries/:id/post
export const PostJournalEntry = async (req, res, next) => {
    try {
        const { params: { id }, userId } = req;
        const { farmId } = await getFarmContext(userId);
        const entry = await JournalEntry.findOne({ where: { id, farmId } });
        if (!entry) throw new ApiError("Not found", 404, "Journal entry not found", true);
        await JournalEntry.postEntry(entry.id, userId);
        return sendSuccessResponse(res, 200, true, "Journal entry posted.", "journal-entries", { id });
    } catch (error) {
        next(error);
    }
};

// PATCH /finance/journal-entries/:id/reverse
export const ReverseJournalEntry = async (req, res, next) => {
    try {
        const { params: { id }, body, userId } = req;
        const { farmId } = await getFarmContext(userId);
        const entry = await JournalEntry.findOne({ where: { id, farmId } });
        if (!entry) throw new ApiError("Not found", 404, "Journal entry not found", true);
        const reversal = await JournalEntry.reverseEntry(entry.id, userId, body?.reason || "Manual reversal");
        return sendSuccessResponse(res, 200, true, "Journal entry reversed.", "journal-entries", reversal);
    } catch (error) {
        next(error);
    }
};
