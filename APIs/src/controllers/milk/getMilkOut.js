import Companies from "../../models/companies.js";
import MilkCategories from "../../models/milkCategories.js";
import MilkOut from "../../models/milkOut.js";
import User from "../../models/user.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";

const GetMilkOut = async (req, res, next) => {
    try {
        const { query: { limit = 20, page = 1, date }, userId } = req;
        const offset = (page - 1) * limit;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        const where = { farmId };
        if (date) where.date = date;
        const { count, rows: milks } = await MilkOut.findAndCountAll({
            where,
            offset,
            limit,
            order: [["createdAt", "DESC"]],
            include: [
                {
                    model: User,
                    as: "approved",
                    attributes: ["uuid", "firstname", "lastname", "email"],
                },
                {
                    model: Companies,
                    as: "companies",
                    attributes: ["uuid", "name", "country"],
                    required: false,
                },
                {
                    model: MilkCategories,
                    as: "category",
                    attributes: ["uuid", "name"],
                    required: false,
                },
            ],
        });

        const totalPages = Math.ceil(count / limit);
        const responseData = {
            milks,
            page: Number(page),
            totalPages: Number(totalPages),
            limit: Number(limit),
            skip: offset,
            totalCount: Number(count),
        };
        return sendSuccessResponse(res, 200, true, "animal milk fetched successfully.", "milk", responseData);
    } catch (error) {
        next(error);
    }
    return GetMilkOut;
};
export default GetMilkOut;
