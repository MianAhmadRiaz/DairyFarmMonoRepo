import { EventTypes } from "../../../constants/index.js";
import logger from "../../../logger/index.js";
import Employee from "../../../models/employee.js";
import FarmConfiguration from "../../../models/farmConfiguration.js";
import { getUserById } from "../../../repo/user.js";
import { ApiError } from "../../../utils/ApiError.js";
import sendSuccessResponse from "../../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../../utils/uuidValidator.js";
import Event from "../../eventEmiiter/events.js";

const deleteEmployee = async (req, res, next) => {
    try {
        const { userId, query: { userId: deletedUserId } } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        if (!isValidUUID(deletedUserId)) throw new ApiError("Invalid Credentials", 400, "Please provide a valid userId", true);
        const findUser = await Employee.findOne({ where: { uuid: deletedUserId, farmId }, raw: true });
        if (!findUser) throw new ApiError("Invalid Credentials", 400, "Employee not found", true);
        if (findUser.isDeleted) throw new ApiError("Already Deleted", 400, "Employee already deleted", true);

        await Employee.update({ isDeleted: true }, { where: { uuid: deletedUserId } });
        await FarmConfiguration.decrement({ current_employees: 1 }, { where: { farmId } });
        const eventPayload = {
            farmId,
            message: `${user.email} has deleted a employee: ${findUser.name} from the farm.`
        }
        Event.emit(EventTypes.Logs, eventPayload);
        logger.info(`User ${findUser.email} has been deleted successfully.`);
        return sendSuccessResponse(res, 200, true, "Employee deleted successfully");
    } catch (error) {
        next(error);
    }
    return false;
};

export default deleteEmployee;
