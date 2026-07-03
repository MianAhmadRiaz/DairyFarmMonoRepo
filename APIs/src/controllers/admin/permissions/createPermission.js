import { getUserById } from "../../../repo/user.js";
import Permissions from "../../../models/permissions.js";
import sendSuccessResponse from "../../../utils/responses/sendSuccessResponse.js";
import { ApiError } from "../../../utils/ApiError.js";

const createPermession = async (req, res, next) => {
    try {
        const { body: { resource, name, description }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        const exist = await Permissions.findOne({ where: { name: name.toLowerCase(), resource: resource?.toLowerCase(), type: "farm" } });
        if (exist) throw new ApiError("Invalid Details", 400, "permission name already exist.", true);
        const permissionPayload = {
            name: name.toLowerCase(),
            resource,
            description,
            createdBy: userId
        };
        const newPermission = await Permissions.create(permissionPayload);
        return sendSuccessResponse(res, 200, true, "permission created successfully.", "permission", newPermission);
    } catch (error) {
        next(error);
    }
    return createPermession;
};
export default createPermession;
