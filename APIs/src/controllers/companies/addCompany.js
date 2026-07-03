import Companies from "../../models/companies.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";

const AddCompany = async (req, res, next) => {
    try {
        const { body: { name, country, arrival_date }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        if (!name) throw new ApiError("Invalid Details", 400, "name is required.", true);
        const checkCompany = await Companies.findOne({ where: { name: name.toLowerCase(), farmId, isDeleted: false }, raw: true });
        if (checkCompany) throw new ApiError("Invalid Details", 400, "Company with provided name already exist in your list.", true);
        const paylaod = {
            farmId,
            name: name.toLowerCase(),
            country,
            arrival_date,
            createdBy: userId,
            updatedBy: userId,
        }
        const createCompany = await Companies.create(paylaod, { raw: true });
        return sendSuccessResponse(res, 200, true, "Company add successfully.", "companies", createCompany);
    } catch (error) {
        next(error);
    }
    return AddCompany;
};
export default AddCompany;
