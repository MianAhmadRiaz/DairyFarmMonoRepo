import { getUserById } from "../../../repo/user.js";
import { ApiError } from "../../../utils/ApiError.js";
import sendSuccessResponse from "../../../utils/responses/sendSuccessResponse.js";
import Admin from "../../../models/softwareAdmin.js";
import isValidUUID from "../../../utils/uuidValidator.js";

async function updateUser(req, res, next) {
    try {
        const { body: { phoneNumber, firstname, lastname, uuid }, userId } = req;
        if (!isValidUUID(uuid)) throw new ApiError("Invalid Credentials", 400, "Please provide a valid userId", true);
        if (!firstname || !lastname) throw new ApiError("Invalid Credentials", 400, "firstName and lastName is required", true);
        const user = await getUserById(userId, true);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const userExists = await Admin.findOne({ where: { uuid, isDeleted: false } });
        if (!userExists) throw new ApiError("Invalid Details", 400, "User with provided uuid is not found.", true);
        const dataToUpdate = {
            firstname: firstname.toLowerCase(),
            lastname: lastname.toLowerCase(),
            phoneNumber: phoneNumber,
        };
        await Admin.update(dataToUpdate, { where: { uuid } });
        return sendSuccessResponse(res, 201, true, "user updated successfully", "admin");
    } catch (error) {
        next(error);
    }
    return false;
}

export default updateUser;
