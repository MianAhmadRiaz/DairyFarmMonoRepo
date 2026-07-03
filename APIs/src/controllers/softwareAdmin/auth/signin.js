import bcrypt from "bcrypt";
import Admin from "../../../models/softwareAdmin.js";
import { ApiError } from "../../../utils/ApiError.js";
import SEND_SANITIZED_SUCCESS_RESPONSE from "../../../utils/responses/sendSanitizedSuccessResponse.js";
import signJwtToken from "../../../utils/signJWT.js";
import keys from "../../../config/keys.js";
import sendSuccessResponse from "../../../utils/responses/sendSuccessResponse.js";
import logger from "../../../logger/index.js";

// Software-admin login: email + password only. The authenticator-app (TOTP) flow
// is disabled for now — a full session token is issued directly. The 2FA models
// and verify-otp endpoint remain in place so it can be re-enabled later.
async function SignIn(req, res, next) {
    try {
        const { email, password } = req.body;
        const userExists = await Admin.findOne({ where: { email: email.toLowerCase() }, raw: true });
        if (!userExists) throw new ApiError("Unauthorized", 400, "Incorrect email or password", true);
        const userVerified = await bcrypt.compare(password, userExists.password);
        if (!userVerified) throw new ApiError("Invalid Credentials", 400, "Incorrect email or password", true);
        if (userExists.isDeleted) throw new ApiError("Unauthorized", 400, "Account deactivated", true);

        const sanitizedUser = SEND_SANITIZED_SUCCESS_RESPONSE(userExists);
        sanitizedUser.must_reset_password = Boolean(userExists.must_reset_password);
        sanitizedUser.role = userExists.role_name || "admin";

        const payload = { userId: userExists.uuid, role: userExists.role_name || "admin" };
        const token = signJwtToken(payload, keys.JWT.TOKEN_EXPIRY);
        const finalResponse = { ...sanitizedUser, token };
        return sendSuccessResponse(res, 200, true, "Signin successful", "signin", finalResponse);
    } catch (error) {
        logger.error(`Error in SignIn: ${error.message}`);
        next(error);
    }
}

export default SignIn;
