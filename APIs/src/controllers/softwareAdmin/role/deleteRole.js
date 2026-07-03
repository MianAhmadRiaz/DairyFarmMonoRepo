import AdminRoles from "../../../models/systemAdminRoles.js";
import { getUserById } from "../../../repo/user.js";
import { ApiError } from "../../../utils/ApiError.js";
import sendSuccessResponse from "../../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../../utils/uuidValidator.js";

const deleteRole = async (req, res, next) => {
    try {
        const { userId, query: { roleId } } = req;
        const user = await getUserById(userId, true);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        if (!isValidUUID(roleId)) throw new ApiError("Invalid Cradentials", 400, "Please provide a valid roleId.", true);
        const exist = await AdminRoles.findOne({ where: { uuid: roleId, isDeleted: false } });
        if (!exist) throw new ApiError("Invalid Details", 400, "Role not found.", true);
        await AdminRoles.update({ isDeleted: true }, { where: { uuid: roleId } });
        return sendSuccessResponse(res, 201, true, "role deleted successfully", "role");
    } catch (error) {
        next(error);
    }
    return deleteRole;
};
export default deleteRole;
