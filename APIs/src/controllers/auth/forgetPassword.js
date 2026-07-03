import { OtpTypes, TokenTypes } from "../../constants/index.js";
import logger from "../../logger/index.js";
import User from "../../models/user.js";
import { ApiError } from "../../utils/ApiError.js";
import SEND_SANITIZED_SUCCESS_RESPONSE from "../../utils/responses/sendSanitizedSuccessResponse.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import sendEmailWithOtp from "../../utils/sendEmail.js";
import signJwtToken from "../../utils/signJWT.js";

async function ForgetPasswordEmail(req, res, next) {
    try {
        const { email } = req.body;
        const newUser = await User.findOne({ where: { email: email.toLowerCase(), isDeleted: false }, raw: true  });
        if (!newUser) throw new ApiError("Bad Request", 400, "Invalid email", true);
        const payload = {
            userId: newUser.uuid,
            type: TokenTypes.ResetPassword,
        }
        await sendEmailWithOtp({ email, otptype: OtpTypes.ForgetPassword, resendOtp: false });
        const sanitizedUser = SEND_SANITIZED_SUCCESS_RESPONSE(newUser);
        const token = signJwtToken(payload, "1h");
        const finalResponse = { ...sanitizedUser, token };
        return sendSuccessResponse(res, 200, true, "Password reset OTP sent to your email successfully.", "Forget Password", finalResponse);
    } catch (error) {
        logger.error(`Error in forgot-password: ${error.message}`);
        next(error);
    }
}

export default ForgetPasswordEmail;
