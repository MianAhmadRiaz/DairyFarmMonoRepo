import RecipeGroup from "../../models/recipeGroup.js";
import FeedFormulations from "../../models/feedFormulation.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../utils/uuidValidator.js";

const GetRecipeGroups = async (req, res, next) => {
    try {
        const { query: { limit = 20, page = 1, groupId }, userId } = req;
        const offset = (page - 1) * limit;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);

        if (isValidUUID(groupId)) {
            const group = await RecipeGroup.findOne({
                where: { uuid: groupId, farmId, isDeleted: false },
                include: [
                    {
                        model: FeedFormulations,
                        as: "recipes",
                        where: { isDeleted: false },
                        required: false,
                        attributes: ['uuid', 'name', 'description', 'target_animal_count', 'cost_per_kg', 'is_default']
                    }
                ]
            });
            
            if (!group) {
                throw new ApiError("Invalid Details", 400, "Recipe group not found with provided groupId", true);
            }
            
            return sendSuccessResponse(res, 200, true, "Recipe group fetched successfully.", "recipeGroup", group);
        }

        const { count, rows: groups } = await RecipeGroup.findAndCountAll({
            where: { isDeleted: false, farmId },
            offset,
            limit,
            order: [["animal_category", "ASC"], ["name", "ASC"]],
            include: [
                {
                    model: FeedFormulations,
                    as: "recipes",
                    where: { isDeleted: false },
                    required: false,
                    attributes: ['uuid', 'name', 'description', 'target_animal_count', 'cost_per_kg', 'is_default']
                }
            ]
        });

        // Add recipe count to each group
        const groupsWithCounts = groups.map(group => ({
            ...group.toJSON(),
            recipeCount: group.recipes ? group.recipes.length : 0
        }));

        const totalPages = Math.ceil(count / limit);
        const responseData = {
            groups: groupsWithCounts,
            page: Number(page),
            totalPages: Number(totalPages),
            limit: Number(limit),
            skip: offset,
            totalCount: Number(count),
        };
        
        return sendSuccessResponse(res, 200, true, "Recipe groups fetched successfully.", "recipeGroups", responseData);
    } catch (error) {
        next(error);
    }
};

export default GetRecipeGroups;