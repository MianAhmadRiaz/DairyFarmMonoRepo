import Designation from "../../models/designation.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";

const addDesignation = async (req, res, next) => {
    try {
        const { body: { name, description }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        if (!name) throw new ApiError("Invalid Details", 400, "name is required.", true);
        const exists = await Designation.findOne({ where: { name: name.toLowerCase(), farmId, isDeleted: false }, raw: true });
        if (exists) throw new ApiError("Invalid Details", 400, "Designation with provided name already exists.", true);
        const created = await Designation.create({
            farmId,
            name: name.toLowerCase(),
            description,
            createdBy: userId,
            updatedBy: userId,
        });
        return sendSuccessResponse(res, 201, true, "Designation added successfully.", "designation", created);
    } catch (error) {
        next(error);
    }
    return false;
};

export default addDesignation;
