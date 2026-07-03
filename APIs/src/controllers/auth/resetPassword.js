import bcrypt from "bcrypt";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import { OtpTypes } from "../../constants/index.js";
import logger from "../../logger/index.js";
import User from "../../models/user.js";

const isExpired = (expiryTime) => Date.now() > Number(expiryTime);

async function ResetPassword(req, res, next) {
    try {
        const { userId } = req;
        const { otp, password } = req.body
        const dbUser = await User.findOne({ where: { uuid: userId, isDeleted: false }, raw: true });
        if (!dbUser) throw new ApiError("Unauthorized", 401, "Invalid user credentials.", true);
        // The reset token alone is NOT enough — the emailed OTP must match too.
        if (!dbUser.otp || !dbUser.otpexpiry) throw new ApiError("Bad Request", 400, "No OTP was requested. Please request a new password reset.", true);
        if (isExpired(dbUser.otpexpiry)) throw new ApiError("Bad Request", 400, "OTP has expired. Please generate a new OTP.", true);
        if (String(dbUser.otp) !== String(otp)) throw new ApiError("Bad Request", 400, "Invalid OTP.", true);
        if (dbUser.otptype !== OtpTypes.ForgetPassword) throw new ApiError("Bad Request", 400, "OTP cannot be used to reset password.", true);
        const email = dbUser.email;
        const hashedPassword = await bcrypt.hash(password, 10);

        // Single-use: clear the OTP as the password changes.
        await User.update(
            { password: hashedPassword, otp: null, otptype: null, otpexpiry: null },
            { where: { email } }
        );
        return sendSuccessResponse(res, 200, true, "Password reset successfully.", "Reset Password");
    } catch (error) {
        logger.error(`Error in reset-password: ${error.message}`);
        next(error);
    }
}

export default ResetPassword;
