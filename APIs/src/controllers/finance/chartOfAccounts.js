import { Op } from "sequelize";
import ChartOfAccounts from "../../models/chartOfAccounts.js";
import { getFarmContext, ensureFinanceSetup } from "../../repo/finance.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";

// GET /finance/accounts
export const GetChartOfAccounts = async (req, res, next) => {
    try {
        const { query: { accountType, search, isActive }, userId } = req;
        const { farmId } = await getFarmContext(userId);
        await ensureFinanceSetup(farmId, userId);

        const where = { farmId };
        if (accountType) where.account_type = accountType;
        if (isActive !== undefined && isActive !== "") where.is_active = isActive === "true" || isActive === true;
        if (search) {
            where[Op.or] = [
                { account_name: { [Op.iLike]: `%${search}%` } },
                { account_code: { [Op.iLike]: `%${search}%` } },
            ];
        }

        const accounts = await ChartOfAccounts.findAll({
            where,
            order: [["account_code", "ASC"]],
        });
        return sendSuccessResponse(res, 200, true, "Chart of accounts fetched successfully.", "chart-of-accounts", { accounts });
    } catch (error) {
        next(error);
    }
};

// GET /finance/accounts/:id
export const GetAccountById = async (req, res, next) => {
    try {
        const { params: { id }, userId } = req;
        const { farmId } = await getFarmContext(userId);
        const account = await ChartOfAccounts.findOne({
            where: { id, farmId },
            include: [
                { model: ChartOfAccounts, as: "parentAccount", attributes: ["id", "account_code", "account_name"] },
                { model: ChartOfAccounts, as: "subAccounts", attributes: ["id", "account_code", "account_name", "current_balance"] },
            ],
        });
        if (!account) throw new ApiError("Not found", 404, "Account not found", true);
        return sendSuccessResponse(res, 200, true, "Account fetched successfully.", "chart-of-accounts", account);
    } catch (error) {
        next(error);
    }
};

// POST /finance/accounts
export const CreateAccount = async (req, res, next) => {
    try {
        const { body, userId } = req;
        const { farmId } = await getFarmContext(userId);
        await ensureFinanceSetup(farmId, userId);

        const { account_code, account_name, account_type, account_subtype, parent_account_id, opening_balance } = body;
        if (!account_code || !account_name || !account_type) {
            throw new ApiError("Validation error", 400, "account_code, account_name and account_type are required", true);
        }

        const exists = await ChartOfAccounts.findOne({ where: { farmId, account_code } });
        if (exists) throw new ApiError("Duplicate", 400, `Account code ${account_code} already exists`, true);

        const account = await ChartOfAccounts.create({
            account_code,
            account_name,
            account_type,
            account_subtype: account_subtype || null,
            parent_account_id: parent_account_id || null,
            opening_balance: opening_balance || 0,
            current_balance: opening_balance || 0,
            is_active: true,
            is_system_account: false,
            farmId,
            createdBy: userId,
        });
        return sendSuccessResponse(res, 201, true, "Account created successfully.", "chart-of-accounts", account);
    } catch (error) {
        next(error);
    }
};

// PUT /finance/accounts/:id
export const UpdateAccount = async (req, res, next) => {
    try {
        const { params: { id }, body, userId } = req;
        const { farmId } = await getFarmContext(userId);
        const account = await ChartOfAccounts.findOne({ where: { id, farmId } });
        if (!account) throw new ApiError("Not found", 404, "Account not found", true);
        if (account.is_system_account && body.account_code && body.account_code !== account.account_code) {
            throw new ApiError("Forbidden", 400, "Cannot change the code of a system account", true);
        }

        const { account_name, account_subtype, parent_account_id, is_active } = body;
        await account.update({
            account_name: account_name ?? account.account_name,
            account_subtype: account_subtype ?? account.account_subtype,
            parent_account_id: parent_account_id ?? account.parent_account_id,
            is_active: is_active ?? account.is_active,
        });
        return sendSuccessResponse(res, 200, true, "Account updated successfully.", "chart-of-accounts", account);
    } catch (error) {
        next(error);
    }
};

// DELETE /finance/accounts/:id
export const DeleteAccount = async (req, res, next) => {
    try {
        const { params: { id }, userId } = req;
        const { farmId } = await getFarmContext(userId);
        const account = await ChartOfAccounts.findOne({ where: { id, farmId } });
        if (!account) throw new ApiError("Not found", 404, "Account not found", true);
        if (account.is_system_account) throw new ApiError("Forbidden", 400, "System accounts cannot be deleted", true);
        if (Number(account.current_balance) !== 0) {
            throw new ApiError("Forbidden", 400, "Cannot delete an account with a non-zero balance", true);
        }
        const children = await ChartOfAccounts.count({ where: { parent_account_id: id } });
        if (children > 0) throw new ApiError("Forbidden", 400, "Cannot delete an account that has sub-accounts", true);

        await account.update({ is_active: false });
        await account.destroy();
        return sendSuccessResponse(res, 200, true, "Account deleted successfully.", "chart-of-accounts", { id });
    } catch (error) {
        next(error);
    }
};
