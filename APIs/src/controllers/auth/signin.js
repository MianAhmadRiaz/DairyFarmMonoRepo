import { ApiError } from "../../utils/ApiError.js";
import bcrypt from "bcrypt";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import SEND_SANITIZED_SUCCESS_RESPONSE from "../../utils/responses/sendSanitizedSuccessResponse.js";
import signJwtToken from "../../utils/signJWT.js";
import logger from "../../logger/index.js";
import User from "../../models/user.js";
import keys from "../../config/keys.js";
import Role from "../../models/role.js";
import Farms from "../../models/farm.js";
import FarmSubscription from "../../models/farmSubscription.js";
import { getUserPermissions } from "../../repo/rbac.js";
import { SubscriptionStatus } from "../../constants/index.js";

async function SignIn(req, res, next) {
    try {
        const { email, password } = req.body;
        const userExists = await User.findOne({
            where: { email: email.toLowerCase() },
            include: [
                {
                    model: Farms,
                    as: "farm",
                    attributes: ["uuid", "name"],
                },
                {
                    model: Role,
                    as: "role",
                    attributes: ["uuid", "name"],
                },
            ],
            raw: true
        });

        if (!userExists) throw new ApiError("Unauthorized", 400, "Incorrect email or password", true);
        const userVerified = await bcrypt.compare(password, userExists.password);
        if (!userVerified) {
            throw new ApiError("Invalid Credentials", 400, "Incorrect email or password", true);
        }
        if (userExists.isDeleted) throw new ApiError("Unauthorized", 400, "Account deactivated", true);
        const { farmId } = userExists;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        const farm = await Farms.findOne({ where: { uuid: farmId }, raw: true });
        if (!farm) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        if (farm.isDeleted) throw new ApiError("Unauthorized", 400, "Your farm account is deleted please contact to support.", true);
        if (farm.isBlocked) throw new ApiError("Unauthorized", 400, "Your farm account is temporarily blocked please contact to support.", true);
        // Subscription enforcement: block sign-in when the farm's latest subscription
        // has been suspended or cancelled for non-payment.
        const latestSubscription = await FarmSubscription.findOne({
            where: { farmId, isDeleted: false },
            order: [["createdAt", "DESC"]],
            attributes: ["status"],
            raw: true,
        });
        if (latestSubscription && [SubscriptionStatus.SUSPENDED, SubscriptionStatus.CANCELLED].includes(latestSubscription.status)) {
            throw new ApiError("Unauthorized", 402, "Your farm subscription is inactive due to a pending payment. Please contact support.", true);
        }
        const payload = {
            userId: userExists.uuid,
            role: userExists["role.name"],
        }
        const sanitizedUser = SEND_SANITIZED_SUCCESS_RESPONSE(userExists);
        // Resolve the user's effective permission names so the client can gate
        // navigation and actions.
        const { permissions, isOwner, roleName } = await getUserPermissions(userExists.roleId);
        sanitizedUser.permissions = permissions;
        sanitizedUser.isOwner = isOwner;
        sanitizedUser.roleName = roleName;
        // First-login flag: the client must route to the set-password screen and
        // the API blocks operational routes until this is cleared.
        sanitizedUser.must_reset_password = Boolean(userExists.must_reset_password);
        const token = signJwtToken(payload, keys.JWT.TOKEN_EXPIRY);
        const finalResponse = { ...sanitizedUser, token };
        return sendSuccessResponse(res, 200, true, "Signin successful", "signin", finalResponse);
    } catch (error) {
        logger.error(`Error in SignIn: ${error.message}`);
        next(error);
    }
}


export default SignIn;
