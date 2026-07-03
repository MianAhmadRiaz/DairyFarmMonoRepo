import { Op } from "sequelize";
import Pen from "../../models/pen.js";
import Shed from "../../models/shed.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../utils/uuidValidator.js";

const resolveFarm = async (userId) => {
    const user = await getUserById(userId);
    if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
    const { farmId } = user;
    if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
    return { user, farmId };
};

const CreateShed = async (req, res, next) => {
    try {
        const { body: { name, description, capacity, location, shed_type }, userId } = req;
        const { farmId } = await resolveFarm(userId);
        if (!name) throw new ApiError("Invalid Details", 400, "Shed name is required.", true);
        const validTypes = ["lactating", "dry", "heifer", "calf", "bull", "mixed"];
        if (shed_type && !validTypes.includes(shed_type)) {
            throw new ApiError("Invalid Details", 400, `shed_type must be one of: ${validTypes.join(", ")}.`, true);
        }
        const existing = await Shed.findOne({ where: { name, farmId, isDeleted: false }, raw: true });
        if (existing) throw new ApiError("Invalid Details", 400, "Shed with this name already exists.", true);
        const shed = await Shed.create({
            name,
            description,
            capacity,
            location,
            shed_type: shed_type || "mixed",
            farmId,
            createdBy: userId,
            updatedBy: userId,
        });
        return sendSuccessResponse(res, 201, true, "Shed created successfully.", "shed", shed);
    } catch (error) {
        next(error);
    }
};

const GetSheds = async (req, res, next) => {
    try {
        const { query: { limit = 50, page = 1 }, userId } = req;
        const offset = (page - 1) * limit;
        const { farmId } = await resolveFarm(userId);
        const { count, rows: sheds } = await Shed.findAndCountAll({
            where: { farmId, isDeleted: false },
            include: [{ model: Pen, as: "pens", where: { isDeleted: false }, required: false, attributes: ["uuid", "name", "pen_type", "capacity"] }],
            offset,
            limit: Number(limit),
            order: [["createdAt", "DESC"]],
            distinct: true,
        });
        const totalPages = Math.ceil(count / limit);
        return sendSuccessResponse(res, 200, true, "sheds fetched successfully.", "sheds", {
            sheds,
            page: Number(page),
            totalPages: Number(totalPages),
            limit: Number(limit),
            skip: offset,
            totalCount: Number(count),
        });
    } catch (error) {
        next(error);
    }
};

// Assign (or unassign with shedId=null) pens to a shed.
const AssignPensToShed = async (req, res, next) => {
    try {
        const { body: { shedId, penIds }, userId } = req;
        const { farmId } = await resolveFarm(userId);
        if (!Array.isArray(penIds) || penIds.length === 0) throw new ApiError("Invalid Details", 400, "Please provide penIds to assign.", true);
        if (shedId) {
            if (!isValidUUID(shedId)) throw new ApiError("Invalid Details", 400, "Please provide a valid shedId.", true);
            const shed = await Shed.findOne({ where: { uuid: shedId, farmId, isDeleted: false }, raw: true });
            if (!shed) throw new ApiError("Invalid Details", 400, "Shed not found with provided shedId.", true);
        }
        const [updatedCount] = await Pen.update(
            { shedId: shedId || null, updatedBy: userId },
            { where: { uuid: { [Op.in]: penIds }, farmId, isDeleted: false } }
        );
        return sendSuccessResponse(res, 200, true, `${updatedCount} pen(s) ${shedId ? "assigned to shed" : "unassigned"} successfully.`, "pens", { updatedCount });
    } catch (error) {
        next(error);
    }
};

export { CreateShed, GetSheds, AssignPensToShed };
