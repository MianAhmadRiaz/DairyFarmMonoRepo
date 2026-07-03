import Admin from "../../../models/softwareAdmin.js";
import AdminRoles from "../../../models/systemAdminRoles.js";
import AdminRoleAndPermission from "../../../models/systmenAdminRoles&Permissions.js";
import { ApiError } from "../../../utils/ApiError.js";
import SEND_SANITIZED_SUCCESS_RESPONSE from "../../../utils/responses/sendSanitizedSuccessResponse.js";
import sendSuccessResponse from "../../../utils/responses/sendSuccessResponse.js";

const Current = async (req, res, next) => {
    try {
        const { userId } = req;
        const adUser = await Admin.findOne({ where: { uuid: userId }, raw: true });
        if (!adUser) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const sanitizedUser = SEND_SANITIZED_SUCCESS_RESPONSE(adUser);
        if (adUser.roleId) {
            const findRole = await AdminRoles.findOne({
                where: { uuid: adUser.roleId },
                attributes: ["uuid"],
                include: [
                    {
                        model: AdminRoleAndPermission,
                        as: "rolePermissions",
                        attributes: ["permissionId"],
                        where: {
                            isDeleted: false,
                        },
                        required: false,
                    },
                ],
            });
            if (findRole) sanitizedUser.permissions = findRole.rolePermissions;
        }
        return sendSuccessResponse(res, 200, true, "User fetched successfully.", "software-admin", sanitizedUser);
    } catch (error) {
        next(error);
    }
    return Current;
};
export default Current;
