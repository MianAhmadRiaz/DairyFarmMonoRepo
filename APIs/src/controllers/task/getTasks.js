import Tasks from "../../models/task.js";
import User from "../../models/user.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../utils/uuidValidator.js";

const GetTasks = async (req, res, next) => {
    try {
        const { query: { limit = 20, page = 1, priority, taskId, userId: requestUserId }, userId } = req;
        const offset = (page - 1) * limit;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        if (isValidUUID(taskId)) {
            const task = await Tasks.findOne({ where: { uuid: taskId, farmId, isDeleted: false }, raw: true });
            if (!task) throw new ApiError("Invalid Details", 400, "Tag not found with provided taskId", true);
            return sendSuccessResponse(res, 200, true, "Task fetched successfully.", "task", task);
        }
        const where = { isDeleted: false, farmId };
        if (priority) where.priority = priority?.toLowerCase();
        if (isValidUUID(requestUserId)) where.assigned_to = requestUserId;
        const { count, rows: tasks } = await Tasks.findAndCountAll({
            where,
            offset,
            limit,
            include: [
                {
                    model: User,
                    as: "user",
                    attributes: ["uuid", "firstname", "lastname" ],
                    required: false,
                },
            ],
            order: [["createdAt", "DESC"]],
        });

        const totalPages = Math.ceil(count / limit);
        const responseData = {
            tasks,
            page: Number(page),
            totalPages: Number(totalPages),
            limit: Number(limit),
            skip: offset,
            totalCount: Number(count),
        };
        return sendSuccessResponse(res, 200, true, "Tasks fetched successfully.", "task", responseData);
    } catch (error) {
        next(error);
    }
    return GetTasks;
};
export default GetTasks;
