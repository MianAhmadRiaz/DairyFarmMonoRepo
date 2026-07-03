import Sequelize from "../../config/db.js";
import FinalMilk from "../../models/finalMilk.js";
import MilkOut from "../../models/milkOut.js";
import Milk from "../../models/milk.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";

const GetMilkingAnalytics = async (req, res, next) => {
    try {
        const { query: { date = new Date().toISOString().split("T")[0] }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);

        const where = { farmId, date };
        const [milkAnalytics, milkout] = await Promise.all([
            Milk.findOne({
                attributes: [
                    [Sequelize.fn("SUM", Sequelize.col("milk1")), "totalMilk1"],
                    [Sequelize.fn("SUM", Sequelize.col("milk2")), "totalMilk2"],
                    [Sequelize.fn("SUM", Sequelize.col("milk3")), "totalMilk3"],
                    [Sequelize.fn("SUM", Sequelize.col("totalMilk")), "totalMilk"]
                ],
                where,
                raw: true,
            }),
            MilkOut.findOne({
                attributes: [
                    [Sequelize.fn("SUM", Sequelize.col("volume")), "totalMilkOut"],
                ],
                where,
                raw: true,
            })
        ]);
        const finalMilk = await FinalMilk.findOne({ where: { farmId }, raw: true });
        const finalResponse = {
            ...milkAnalytics,
            totalMilkOut: milkout?.totalMilkOut || 0,
            finalMilk: finalMilk?.milk || 0,
        }
        return sendSuccessResponse(res, 200, true, "milk analytics fetched successfully.", "milk", finalResponse);
    } catch (error) {
        next(error);
    }
    return GetMilkingAnalytics;
};
export default GetMilkingAnalytics;
