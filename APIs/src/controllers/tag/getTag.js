import Tag from "../../models/tag.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../utils/uuidValidator.js";

const GetAllTags = async (req, res, next) => {
    try {
        const { query: { limit = 20, page = 1, all = false, tagId }, userId } = req;
        const offset = (page - 1) * limit;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        if (isValidUUID(tagId)) {
            const tag = await Tag.findOne({ where: { uuid: tagId, farmId, isDeleted: false }, raw: true });
            if (!tag) throw new ApiError("Invalid Details", 400, "Tag not found with provided tagId", true);
            return sendSuccessResponse(res, 200, true, "tag fetched successfully.", "tag", tag);
        }
        const where = { isDeleted: false, farmId };
        if (!all) where.is_used = false;
        const { count, rows: tags } = await Tag.findAndCountAll({
            where,
            offset,
            limit,
            order: [["createdAt", "DESC"]],
        });

        const totalPages = Math.ceil(count / limit);
        const responseData = {
            tags,
            page: Number(page),
            totalPages: Number(totalPages),
            limit: Number(limit),
            skip: offset,
            totalCount: Number(count),
        };
        return sendSuccessResponse(res, 200, true, "tags fetched successfully.", "tag", responseData);
    } catch (error) {
        next(error);
    }
    return GetAllTags;
};
export default GetAllTags;
