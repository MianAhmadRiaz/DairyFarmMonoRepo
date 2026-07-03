import { Op } from "sequelize";
import Milk from "../../models/milk.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";

function getPreviousDate(dateInput, days = 30) {
    const date = new Date(dateInput);
    date.setDate(date.getDate() - days);
    return date;
}
function generateDateArray(start, end) {
    const dates = [];
    let current = new Date(start);
    const last = new Date(end);
    while (current <= last) {
        dates.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
    }
    return dates;
}
const GetPendingMilkApprovalDates = async (req, res, next) => {
    try {
        const { userId, query: { date = new Date().toISOString().split("T")[0], daysToCheck = 30 } } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        const startDate = getPreviousDate(date, daysToCheck);
        const allDatesInRange = generateDateArray(startDate, date);
        const where = {
            farmId,
            date: {
                [Op.between]: [startDate, date]
            }
        };
        const existingDates = await Milk.findAll({
            attributes: ["date"],
            where,
            group: ["date"],
            raw: true
        })
        const approvedDates = existingDates.map(row => (row.date));
        const missingDates = allDatesInRange.filter(date => !approvedDates.includes(date));
        const responseData = {
            pendingMilkApprovalDates: missingDates,
            count: missingDates.length
        };
        return sendSuccessResponse(res, 200, true, "animal pending approval milk dates fetch successfully.", "milk", responseData);
    } catch (error) {
        next(error);
    }
    return GetPendingMilkApprovalDates;
};
export default GetPendingMilkApprovalDates;
