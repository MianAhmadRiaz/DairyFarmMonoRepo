import Departments from "../../models/departments.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../utils/uuidValidator.js";

const getDepartments = async (req, res, next) => {
    try {
        const { query: { limit = 20, page = 1, departmentId }, userId } = req;
        const offset = (page - 1) * limit;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        if (isValidUUID(departmentId)) {
            const department = await Departments.findOne({ where: { uuid: departmentId, farmId, isDeleted: false }, raw: true });
            if (!department) throw new ApiError("Invalid Details", 400, "Department not found with provided departmentId", true);
            return sendSuccessResponse(res, 200, true, "Department fetched successfully.", "department", department);
        }
        const where = { isDeleted: false, farmId };
        const { count, rows: departments } = await Departments.findAndCountAll({
            where,
            offset,
            limit,
            order: [["createdAt", "DESC"]],
        });

        const totalPages = Math.ceil(count / limit);
        const responseData = {
            departments,
            page: Number(page),
            totalPages: Number(totalPages),
            limit: Number(limit),
            skip: offset,
            totalCount: Number(count),
        };
        return sendSuccessResponse(res, 200, true, "Departments fetched successfully.", "department", responseData);
    } catch (error) {
        next(error);
    }
    return getDepartments;
};
export default getDepartments;
