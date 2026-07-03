import Companies from "../../models/companies.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../utils/uuidValidator.js";

const GetCompanies = async (req, res, next) => {
    try {
        const { query: { limit = 20, page = 1, companyId }, userId } = req;
        const offset = (page - 1) * limit;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        if (isValidUUID(companyId)) {
            const company = await Companies.findOne({ where: { uuid: companyId, farmId, isDeleted: false }, raw: true });
            if (!company) throw new ApiError("Invalid Details", 400, "Company not found with provided companyId", true);
            return sendSuccessResponse(res, 200, true, "Company fetched successfully.", "companies", company);
        }
        const where = { isDeleted: false, farmId };
        const { count, rows: companies } = await Companies.findAndCountAll({
            where,
            offset,
            limit,
            order: [["createdAt", "DESC"]],
        });

        const totalPages = Math.ceil(count / limit);
        const responseData = {
            companies,
            page: Number(page),
            totalPages: Number(totalPages),
            limit: Number(limit),
            skip: offset,
            totalCount: Number(count),
        };
        return sendSuccessResponse(res, 200, true, "Companies fetched successfully.", "companies", responseData);
    } catch (error) {
        next(error);
    }
    return GetCompanies;
};
export default GetCompanies;
