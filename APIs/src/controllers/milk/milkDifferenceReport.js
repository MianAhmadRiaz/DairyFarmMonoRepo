import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import sequelize from "../../config/db.js";
import FarmConfiguration from "../../models/farmConfiguration.js";

const GetMilkDiffernceReport = async (req, res, next) => {
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
        const query = `SELECT 
    a.uuid,
    a.name,
    a.gender,
    a.calving_date,
    a.lactation,
    a."breedType",
    a."animalType",
    a."tagId",
    a."tagName",
    a.pregnancy_status,
    p.name AS "penName",
COALESCE(MAX(CASE WHEN mi.date = :startDate THEN mi."totalMilk" END), 0) AS "milkOnStartDate",
COALESCE(MAX(CASE WHEN mi.date = :endDate THEN mi."totalMilk" END), 0) AS "milkOnEndDate",
COALESCE(MAX(CASE WHEN mi.date = :endDate THEN mi."totalMilk" END), 0) -
COALESCE(MAX(CASE WHEN mi.date = :startDate THEN mi."totalMilk" END), 0) AS "milkDifference"
FROM 
    animals a
LEFT JOIN 
milk_in mi ON mi."animalId" = a.uuid AND mi.date BETWEEN :startDate AND :endDate AND mi."farmId" = :farmId
LEFT JOIN 
    pen p ON a."penId" = p.uuid
WHERE 
    a."farmId" = :farmId AND a."isDeleted" = false AND a.gender = :gender -- assuming you soft-delete animals
GROUP BY 
    a.uuid, p.name, a.gender, a.name, a.calving_date, a.lactation, a."breedType", a."animalType", a."tagId"
ORDER BY 
    a.uuid ASC;
`
        const milks = await sequelize.query(query, {
            replacements: { startDate, endDate, farmId, gender: "female" },
            type: sequelize.QueryTypes.SELECT
        });

        const responseData = {
            milks,
        };
        return sendSuccessResponse(res, 200, true, "milk differnce report fetched successfully.", "milk", responseData);
    } catch (error) {
        next(error);
    }
    return GetMilkDiffernceReport;
};
export default GetMilkDiffernceReport;
