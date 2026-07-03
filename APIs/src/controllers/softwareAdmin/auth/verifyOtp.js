import Admin from "../../../models/softwareAdmin.js";
import { getUserById } from "../../../repo/user.js";
import { ApiError } from "../../../utils/ApiError.js";
import SEND_SANITIZED_SUCCESS_RESPONSE from "../../../utils/responses/sendSanitizedSuccessResponse.js";
import sendSuccessResponse from "../../../utils/responses/sendSuccessResponse.js";
import signJwtToken from "../../../utils/signJWT.js";
import { verifyAuthenticatorOTP } from "../../../utils/twoFactorAuthentication/authenticationFunctions.js";

const TwoFactorAuthentication = async (req, res, next) => {
    try {
        const { userId, body: { otp } } = req;
        const user = await getUserById(userId, true);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        if (!otp) throw new ApiError("Invalid Credentials", 400, "otp is required", true);
        if (!user.TwoFASecret) throw new ApiError("Invalid Credentials", 400, "You don't have two-factor authentication!.", true);
        const verifyOtp = verifyAuthenticatorOTP(user.TwoFASecret, otp);
        if (!verifyOtp) throw new ApiError("Invalid Credentials", 400, "otp is invalid.", true);
        const payload = {
            userId: user.uuid,
            role: user.role_name || "admin",
        }
        const token = signJwtToken(payload);
        if (!user.authentication) await Admin.update({ authentication: true }, { where: { uuid: user.uuid } });
        const sanitizedUser = SEND_SANITIZED_SUCCESS_RESPONSE(user);
        sanitizedUser.token = token;
        return sendSuccessResponse(res, 200, true, "Signin successful", sanitizedUser);
    } catch (error) {
        next(error);
    }
    return false;
};

export default TwoFactorAuthentication;
