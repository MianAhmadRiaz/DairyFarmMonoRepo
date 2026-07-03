import bcrypt from "bcrypt";
import { getUserById } from "../../../repo/user.js";
import { ApiError } from "../../../utils/ApiError.js";
import sendSuccessResponse from "../../../utils/responses/sendSuccessResponse.js";
import Admin from "../../../models/softwareAdmin.js";

async function ChangeUserPassword(req, res, next) {
    try {
        const { body: { uuid, password, confirmpassword }, userId } = req;
        if (!password) throw new ApiError("Invalid Credentials", 400, "Password is required", true);
        if (!confirmpassword) throw new ApiError("Invalid Credentials", 400, "Confirmpassword is required", true);
        if (confirmpassword !== password) throw new ApiError("Invalid Credentials", 400, "Password and ConfirmPassword does not match", true);
        const user = await getUserById(userId, true);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const userExists = await Admin.findOne({ where: { uuid, isDeleted: false } });
        if (!userExists) throw new ApiError("Invalid Details", 400, "User with provided uuid not found", true);
        const hashedPassword = await bcrypt.hash(password, 10);
        const userData = {
            password: hashedPassword,
        };
        await Admin.update(userData, { where: { uuid } });
        return sendSuccessResponse(res, 201, true, "user password updated successfully", "admin");
    } catch (error) {
        next(error);
    }
    return false;
}

export default ChangeUserPassword;
