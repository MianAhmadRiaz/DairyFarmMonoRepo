import Tasks from "../../models/task.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../utils/uuidValidator.js";

const DeleteTask = async (req, res, next) => {
    try {
        const { query: { taskId }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        if (!isValidUUID(taskId)) throw new ApiError("Invalid Details", 400, "Please provide a valid taskId.", true);
        const task = await Tasks.findOne({ where: { uuid: taskId, farmId, isDeleted: false }, raw: true });
        if (!task) throw new ApiError("Invalid Details", 400, "Task not found with provided taskId", true);
        await Tasks.update({ isDeleted: true }, { where: { uuid: taskId, farmId } });
        return sendSuccessResponse(res, 200, true, "Task delete successfully.", "task");
    } catch (error) {
        next(error);
    }
    return DeleteTask;
};
export default DeleteTask;
