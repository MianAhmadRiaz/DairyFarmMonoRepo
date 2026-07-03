import Companies from "../../models/companies.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../utils/uuidValidator.js";

const DeleteCompany = async (req, res, next) => {
    try {
        const { query: { companyId }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        if (!isValidUUID(companyId)) throw new ApiError("Invalid Details", 400, "Please provide a valid companyId.", true);
        const checkCompany = await Companies.findOne({ where: { uuid: companyId, isDeleted: false }, raw: true });
        if (!checkCompany) throw new ApiError("Invalid Details", 400, "Company not found with provided companyId", true);
        await Companies.update({ isDeleted: true }, { where: { uuid: companyId } });
        return sendSuccessResponse(res, 200, true, "Company delete successfully.", "companies");
    } catch (error) {
        next(error);
    }
    return DeleteCompany;
};
export default DeleteCompany;
