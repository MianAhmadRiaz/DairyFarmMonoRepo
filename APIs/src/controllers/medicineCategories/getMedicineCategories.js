import MedicineCategories from "../../models/medicineSubCategories.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../utils/uuidValidator.js";

const GetMedicineCategory = async (req, res, next) => {
    try {
        const { query: { limit = 20, page = 1,categoryId }, userId } = req;
        const offset = (page - 1) * limit;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        if (isValidUUID(categoryId)) {
            const category = await MedicineCategories.findOne({ where: { uuid: categoryId, farmId, isDeleted: false }, raw: true });
            if (!category) throw new ApiError("Invalid Details", 400, "Medicine category not found with provided categoryId", true);
            return sendSuccessResponse(res, 200, true, "Medicine Category fetched successfully.", "medicine-category", category);
        }
        const where = { isDeleted: false, farmId };
        const { count, rows: categories } = await MedicineCategories.findAndCountAll({
            where,
            offset,
            limit,
            order: [["createdAt", "DESC"]],
        });

        const totalPages = Math.ceil(count / limit);
        const responseData = {
            categories,
            page: Number(page),
            totalPages: Number(totalPages),
            limit: Number(limit),
            skip: offset,
            totalCount: Number(count),
        };
        return sendSuccessResponse(res, 200, true, "Medicine categories fetched successfully.", "medicine-category", responseData);
    } catch (error) {
        next(error);
    }
    return GetMedicineCategory;
};
export default GetMedicineCategory;
