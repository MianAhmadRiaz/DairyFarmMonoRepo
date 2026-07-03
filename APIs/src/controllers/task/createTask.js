import Tasks from "../../models/task.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../utils/uuidValidator.js";

const CreateTask = async (req, res, next) => {
    try {
        const { body: { task, description, assigned_to, dead_line, priority, assign_date: assignDate }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        let assign_date = assignDate;
        if (isValidUUID(assigned_to)) {
            const checkUser = await getUserById(assigned_to);
            if (!checkUser) throw new ApiError("Unauthorized", 400, "The user you want assign task is not found.", true);
            assign_date = assign_date || new Date()
        }
        const paylaod = {
            farmId,
            task,
            dead_line,
            description,
            assigned_to,
            priority,
            assign_date,
            createdBy: userId,
            updatedBy: userId,
        }
        const newTask = await Tasks.create(paylaod);
        return sendSuccessResponse(res, 200, true, "Task add successfully.", "Task", newTask);
    } catch (error) {
        next(error);
    }
    return CreateTask;
};
export default CreateTask;
