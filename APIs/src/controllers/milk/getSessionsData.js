import Animal from "../../models/animal.js";
import MilkingSession from "../../models/milkingSession.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";

const GetMilkingSessionsData = async (req, res, next) => {
    try {
        const { query: { limit = 10, page = 1, date = new Date().toISOString().split("T")[0] }, userId } = req;
        const offset = (page - 1) * limit;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        
        const where = { farmId, isDeleted: false, gender: "female" };
        const count = await Animal.count({ where });
        const animals = await Animal.findAll({
            where,
            offset,
            limit,
            attributes: ["uuid", "name", "tagId", "penId", "lactation", "tagName"],
            include: [
                {
                    model: MilkingSession,
                    as: "milkingSessions",
                    attributes: ["milkingTime", "milk"],
                    where: { date },
                    required: false, // Allows animals with no milking session
                },
            ],
        });

        const milkingTimes = ["morning", "afternoon", "evening"];
        const formattedData = animals.map((animal) => {
            const sessionsMap = new Map(
                animal.milkingSessions.map((session) => [session.milkingTime, session.milk])
            );
            const fullSessions = milkingTimes.map((time) => ({
                milkingTime: time,
                milk: sessionsMap.get(time) || 0,
            }));
        
            return {
                uuid: animal.uuid,
                name: animal.name,
                penId: animal.penId,
                tagId: animal.tagId,
                tagName: animal.tagName,
                lactation: animal.lactation || 1,
                date,
                sessions: fullSessions,
            };
        });
        
        const totalPages = Math.ceil(count / limit);
        const responseData = {
            milkingSessions: formattedData,
            page: Number(page),
            totalPages: Number(totalPages),
            limit: Number(limit),
            skip: offset,
            totalCount: Number(count),
        };
        return sendSuccessResponse(res, 200, true, "animal milk fetched successfully.", "milk", responseData);
    } catch (error) {
        next(error);
    }
    return GetMilkingSessionsData;
};
export default GetMilkingSessionsData;
