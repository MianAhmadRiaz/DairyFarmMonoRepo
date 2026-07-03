import sequelize from "../../config/db.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";

const GetMilkByDate = async (req, res, next) => {
    try {
        const { query: { date = new Date().toISOString().split("T")[0] }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        const query = `
        SELECT 
        COALESCE(SUM("totalMilk"), 0) AS total_milk,
        COALESCE(SUM(milk1), 0) AS total_milk1,
        COALESCE(SUM(milk2), 0) AS total_milk2,
        COALESCE(SUM(milk3), 0) AS total_milk3
        FROM milk_in
        WHERE "date" = :date AND "farmId" = :farmId AND "isDeleted" = false;
        `
        const replacements = {
            farmId,
            date,
        };
        const result = await sequelize.query(query, {
            replacements,
            type: sequelize.QueryTypes.SELECT,
        });
        const milkOutQuery = `
    SELECT COALESCE(SUM(volume), 0) AS total_volume
    FROM milk_out
    WHERE "farmId" = :farmId
      AND "date" = :date
      AND "isDeleted" = false;
`;

        const milkOutQueryResult = await sequelize.query(milkOutQuery, {
            replacements,
            type: sequelize.QueryTypes.SELECT,
        });

        const responseData = {
            ...result[0],
            totalMilkOut: milkOutQueryResult[0].total_volume || 0,
            totalRemainingMilk: (result[0].total_milk - milkOutQueryResult[0].total_volume || 0),
        };
        return sendSuccessResponse(res, 200, true, "animal milk fetched successfully.", "milk", responseData);
    } catch (error) {
        next(error);
    }
    return GetMilkByDate;
};
export default GetMilkByDate;
