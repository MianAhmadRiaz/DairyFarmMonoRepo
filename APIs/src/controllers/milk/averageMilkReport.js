import { col, fn, Op } from "sequelize";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import MilkIn from "../../models/milk.js";
import FarmConfiguration from "../../models/farmConfiguration.js";

const GetMilkAverageReport = async (req, res, next) => {
    try {
        const { query: { startDate, endDate = new Date().toISOString().split("T")[0] }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        const config = await FarmConfiguration.findOne({ where: { farmId }, raw: true });
        if (!config) throw new ApiError("Unauthorized", 400, "Farm configuration not found.", true);
        const { is_milk_report_allow } = config;
        if (!is_milk_report_allow) throw new ApiError("Unauthorized", 400, "You are not allowed to generate milk report.", true);
        if (!startDate) throw new ApiError("Unauthorized", 400, "Start date is required.", true);
        // Fetch Data
        const milks = await MilkIn.findAll({
            attributes: [
                [fn("DATE", col("date")), "date"],
                [fn("SUM", col("totalMilk")), "totalMilk"],
                [fn("COUNT", fn("DISTINCT", col("animalId"))), "totalAnimals"],
                [fn("AVG", col("totalMilk")), "averageMilk"],
                [fn("MAX", col("totalMilk")), "maxMilk"],
                [fn("MIN", col("totalMilk")), "minMilk"]
            ],
            where: {
                date: {
                    [Op.between]: [startDate, endDate]
                },
                farmId,
            },
            group: [fn("DATE", col("date"))],
            order: [[fn("DATE", col("date")), "ASC"]],
            raw: true
        });
        const responseData = {
            milks,
        };
        return sendSuccessResponse(res, 200, true, "average milk report fetched successfully.", "milk", responseData);
    } catch (error) {
        next(error);
    }
    return GetMilkAverageReport;
};
export default GetMilkAverageReport;
