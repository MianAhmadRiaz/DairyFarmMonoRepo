import logger from "../../../logger/index.js";
import Admin from "../../../models/softwareAdmin.js";
import { getUserById } from "../../../repo/user.js";
import { ApiError } from "../../../utils/ApiError.js";
import sendSuccessResponse from "../../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../../utils/uuidValidator.js";

const deleteUser = async (req, res, next) => {
    try {
        const { userId, query: { userId: deletedUserId } } = req;
        const user = await getUserById(userId, true);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        if (!isValidUUID(deletedUserId)) throw new ApiError("Invalid Credentials", 400, "Please provide a valid userId", true);
        const findUser = await Admin.findOne({ where: { uuid: deletedUserId }, raw: true });
        if (!findUser) throw new ApiError("Invalid Credentials", 400, "user not found", true);
        if (findUser.isDeleted) throw new ApiError("Already Deleted", 400, "user already deleted", true);

        await Admin.update({ isDeleted: true }, { where: { uuid: deletedUserId } });
        logger.info(`User ${findUser.email} has been deleted successfully.`);
        return sendSuccessResponse(res, 200, true, "user deleted successfully");
    } catch (error) {
        next(error);
    }
    return false;
};

export default deleteUser;
