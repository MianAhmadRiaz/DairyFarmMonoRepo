import bcrypt from "bcrypt";
import Admin from "../../../models/softwareAdmin.js";
import { ApiError } from "../../../utils/ApiError.js";
import logger from "../../../logger/index.js";
import sendSuccessResponse from "../../../utils/responses/sendSuccessResponse.js";

// First-login password set for a software admin (e.g. the seeded super admin).
async function SetPassword(req, res, next) {
    try {
        const { userId } = req;
        const { currentPassword, password } = req.body;
        const admin = await Admin.findOne({ where: { uuid: userId, isDeleted: false } });
        if (!admin) throw new ApiError("Unauthorized", 401, "Invalid admin.", true);

        const ok = await bcrypt.compare(currentPassword || "", admin.password);
        if (!ok) throw new ApiError("Bad Request", 400, "Current password is incorrect.", true);

        const hashed = await bcrypt.hash(password, 10);
        await admin.update({ password: hashed, must_reset_password: false });
        return sendSuccessResponse(res, 200, true, "Password set successfully.", "set-password");
    } catch (error) {
        logger.error(`Error in admin set-password: ${error.message}`);
        next(error);
    }
}

export default SetPassword;
