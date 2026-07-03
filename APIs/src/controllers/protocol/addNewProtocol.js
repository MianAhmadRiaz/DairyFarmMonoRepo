import ProtocolInfo from "../../models/protocolsInfo.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";

const AddNewProtocol = async (req, res, next) => {
    try {
        const { body: { name, injections, ai_time, max_DIM, min_DIM }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        const checkProtocol = await ProtocolInfo.findOne({ where: { name: name.toLowerCase(), farmId }, raw: true });
        if (checkProtocol) throw new ApiError("Invalid Details", 400, "Protocol with provided name already exist in your list.", true);
        const paylaod = {
            farmId,
            name: name.toLowerCase(),
            injections,
            ai_time,
            min_DIM,
            max_DIM,
            createdBy: userId,
            updatedBy: userId,
        }
        const addNewProtocol = await ProtocolInfo.create(paylaod);
        return sendSuccessResponse(res, 200, true, "Protocol add successfully.", "protocol", addNewProtocol);
    } catch (error) {
        next(error);
    }
    return AddNewProtocol;
};
export default AddNewProtocol;
