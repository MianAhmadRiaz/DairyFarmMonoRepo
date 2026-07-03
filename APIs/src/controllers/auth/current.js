import Farms from "../../models/farm.js";
import User from "../../models/user.js";
import { ApiError } from "../../utils/ApiError.js";
import { getUserPermissions } from "../../repo/rbac.js";
import SEND_SANITIZED_SUCCESS_RESPONSE from "../../utils/responses/sendSanitizedSuccessResponse.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";

const Current = async (req, res, next) => {
  try {
    const { userId } = req;
    const adUser = await User.findOne({ where: { uuid: userId }, include: [{ model: Farms, as: "farm" }], raw: true });
    if (!adUser) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
    const sanitizedUser = SEND_SANITIZED_SUCCESS_RESPONSE(adUser);
    const { permissions, isOwner, roleName } = await getUserPermissions(adUser.roleId);
    sanitizedUser.permissions = permissions;
    sanitizedUser.isOwner = isOwner;
    sanitizedUser.roleName = roleName;
    return sendSuccessResponse(res, 200, true, "User fetched successfully.", null, sanitizedUser);
  } catch (error) {
    next(error);
  }
};
export default Current;
