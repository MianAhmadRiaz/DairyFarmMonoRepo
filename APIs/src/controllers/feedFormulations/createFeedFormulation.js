import { Op } from "sequelize";
import sequelize from "../../config/db.js";
import logger from "../../logger/index.js";
import FeedFormulations from "../../models/feedFormulation.js";
import FeedFormulationsItems from "../../models/feedFormulationItems.js";
import RecipeGroup from "../../models/recipeGroup.js";
import StockItems from "../../models/stockItem.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";

const CreateFeedFormulation = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
        const { body: { name, description, items, recipeGroupId, cost_per_kg, target_animal_count, nutritional_notes }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        if (!Array.isArray(items) || items.length === 0) throw new ApiError("Invalid Details", 400, "Please provide at least one ingredient item.", true);
        const checkFormulation = await FeedFormulations.findOne({ where: { name: name?.trim()?.toLowerCase(), farmId, isDeleted: false }, raw: true });
        if (checkFormulation) throw new ApiError("Invalid Details", 400, "Feed formulation with provided name already exist in your list.", true);

        // Every ingredient must be a stock item belonging to this farm.
        const itemIds = items.map((item) => item.itemId);
        const validItems = await StockItems.findAll({ where: { uuid: { [Op.in]: itemIds }, farmId, isDeleted: false }, attributes: ["uuid"], raw: true });
        if (validItems.length !== new Set(itemIds).size) {
            throw new ApiError("Invalid Details", 400, "One or more ingredient items do not exist on this farm.", true);
        }

        if (recipeGroupId) {
            const group = await RecipeGroup.findOne({ where: { uuid: recipeGroupId, farmId, isDeleted: false }, raw: true });
            if (!group) throw new ApiError("Invalid Details", 400, "Recipe group not found on this farm.", true);
        }

        const paylaod = {
            farmId,
            name: name.trim().toLowerCase(),
            description,
            recipeGroupId: recipeGroupId || null,
            cost_per_kg: cost_per_kg ?? null,
            target_animal_count: target_animal_count ?? null,
            nutritional_notes,
            createdBy: userId,
            updatedBy: userId,
        }
        const createfeedFormulation = await FeedFormulations.create(paylaod, { transaction, raw: true });
        const feedFormulationsItems = [];
        items.map((item) => {
            const { itemId, quantity } = item;
            feedFormulationsItems.push({
                farmId,
                itemId,
                quantity,
                formulationId: createfeedFormulation.uuid,
                formulation_name: createfeedFormulation.name,
            })
        })
        await FeedFormulationsItems.bulkCreate(feedFormulationsItems, { transaction });
        await transaction.commit();
        return sendSuccessResponse(res, 200, true, "Feed formulation add successfully.", "feed-formulation", createfeedFormulation);
    } catch (error) {
        logger.error(`Error in create feed formulation: ${error.message}`);
        await transaction.rollback();
        next(error);
    }
    return CreateFeedFormulation;
};
export default CreateFeedFormulation;
