import Injection from "../../models/injections.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";

const AddInjection = async (req, res, next) => {
    try {
        const { body: { name }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        const checkProtocol = await Injection.findOne({ where: { name: name.toLowerCase(), farmId }, raw: true });
        if (checkProtocol) throw new ApiError("Invalid Details", 400, "Injection with provided name already exist in your list.", true);
        const paylaod = {
            farmId,
            name: name.toLowerCase(),
            createdBy: userId,
            updatedBy: userId,
        }
        const addNewInejction = await Injection.create(paylaod);
        return sendSuccessResponse(res, 200, true, "Injection add successfully.", "protocol", addNewInejction);
    } catch (error) {
        next(error);
    }
    return AddInjection;
};
export default AddInjection;
