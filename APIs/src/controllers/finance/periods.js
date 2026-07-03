import FinancialPeriod from "../../models/financialPeriod.js";
import { getFarmContext, ensureFinanceSetup, createCurrentPeriod, recalcPeriodTotals } from "../../repo/finance.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";

// GET /finance/periods
export const GetPeriods = async (req, res, next) => {
    try {
        const { userId } = req;
        const { farmId } = await getFarmContext(userId);
        await ensureFinanceSetup(farmId, userId);
        const periods = await FinancialPeriod.findAll({ where: { farmId }, order: [["start_date", "DESC"]] });
        return sendSuccessResponse(res, 200, true, "Periods fetched successfully.", "financial-periods", { periods });
    } catch (error) {
        next(error);
    }
};

// GET /finance/periods/current
export const GetCurrentPeriod = async (req, res, next) => {
    try {
        const { userId } = req;
        const { farmId } = await getFarmContext(userId);
        await ensureFinanceSetup(farmId, userId);
        let period = await FinancialPeriod.getCurrentPeriod(farmId);
        if (!period) period = await createCurrentPeriod(farmId, userId);
        await recalcPeriodTotals(period.id, farmId);
        period = await FinancialPeriod.findByPk(period.id);
        return sendSuccessResponse(res, 200, true, "Current period fetched successfully.", "financial-periods", period);
    } catch (error) {
        next(error);
    }
};

// POST /finance/periods
export const CreatePeriod = async (req, res, next) => {
    try {
        const { body, userId } = req;
        const { farmId } = await getFarmContext(userId);
        await ensureFinanceSetup(farmId, userId);
        const { period_type, start_date } = body;
        if (!start_date) throw new ApiError("Validation error", 400, "start_date is required", true);
        const period = await FinancialPeriod.createNewPeriod(farmId, userId, period_type || "monthly", new Date(start_date));
        return sendSuccessResponse(res, 201, true, "Period created successfully.", "financial-periods", period);
    } catch (error) {
        next(error);
    }
};

// PATCH /finance/periods/:id/close
export const ClosePeriod = async (req, res, next) => {
    try {
        const { params: { id }, userId } = req;
        const { farmId } = await getFarmContext(userId);
        const period = await FinancialPeriod.findOne({ where: { id, farmId } });
        if (!period) throw new ApiError("Not found", 404, "Period not found", true);
        await recalcPeriodTotals(period.id, farmId);
        await FinancialPeriod.closePeriod(period.id, userId);
        const closed = await FinancialPeriod.findByPk(period.id);
        return sendSuccessResponse(res, 200, true, "Period closed successfully.", "financial-periods", closed);
    } catch (error) {
        next(error);
    }
};
