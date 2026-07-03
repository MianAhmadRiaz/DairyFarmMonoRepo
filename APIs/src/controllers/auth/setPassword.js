import bcrypt from "bcrypt";
import { ApiError } from "../../utils/ApiError.js";
import logger from "../../logger/index.js";
import User from "../../models/user.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";

// First-login password set. The user is authenticated (temp-password token), so
// no OTP is needed — they simply choose a new password, which clears the
// must_reset_password flag and grants full access.
async function SetPassword(req, res, next) {
    try {
        const { userId } = req;
        const { currentPassword, password } = req.body;
        const user = await User.findOne({ where: { uuid: userId, isDeleted: false } });
        if (!user) throw new ApiError("Unauthorized", 401, "Invalid user.", true);

        // Verify the current (temporary) password to prevent token-only takeover.
        const ok = await bcrypt.compare(currentPassword || "", user.password);
        if (!ok) throw new ApiError("Bad Request", 400, "Current password is incorrect.", true);

        const hashed = await bcrypt.hash(password, 10);
        await user.update({ password: hashed, must_reset_password: false });
        return sendSuccessResponse(res, 200, true, "Password set successfully. You now have full access.", "set-password");
    } catch (error) {
        logger.error(`Error in set-password: ${error.message}`);
        next(error);
    }
}

export default SetPassword;
