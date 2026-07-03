import FeedFormulations from "../../models/feedFormulation.js";
import FeedFormulationItems from "../../models/feedFormulationItems.js";
import RecipeGroup from "../../models/recipeGroup.js";
import StockItem from "../../models/stockItem.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import sequelize from "../../config/db.js";

const CreateRecipe = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { 
            userId, 
            body: { 
                name, 
                description, 
                recipeGroupId, 
                target_animal_count = 0,
                cost_per_kg = 0,
                nutritional_notes,
                is_default = false,
                ingredients = [] 
            } 
        } = req;
        
        if (!name || !recipeGroupId || !ingredients.length) {
            throw new ApiError("Invalid Details", 400, "Name, recipe group, and ingredients are required.", true);
        }

        // Each ingredient must reference a stock item and carry a positive quantity (proportion).
        for (const ing of ingredients) {
            if (!ing.stockItemId || !(parseFloat(ing.quantity) > 0)) {
                throw new ApiError("Invalid Details", 400, "Each ingredient requires a stockItemId and a quantity greater than 0.", true);
            }
        }

        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);

        // Verify recipe group exists and belongs to farm
        const recipeGroup = await RecipeGroup.findOne({
            where: { uuid: recipeGroupId, farmId, isDeleted: false }
        });

        if (!recipeGroup) {
            throw new ApiError("Invalid Details", 400, "Recipe group not found.", true);
        }

        // Check if recipe with same name exists in the farm
        const existingRecipe = await FeedFormulations.findOne({
            where: { 
                name, 
                farmId, 
                isDeleted: false 
            }
        });

        if (existingRecipe) {
            throw new ApiError("Invalid Details", 400, "Recipe with this name already exists.", true);
        }

        // Validate all ingredient stock items exist and belong to the farm
        const stockItemIds = ingredients.map(ing => ing.stockItemId);
        const stockItems = await StockItem.findAll({
            where: { uuid: stockItemIds, farmId, isDeleted: false }
        });

        if (stockItems.length !== new Set(stockItemIds).size) {
            throw new ApiError("Invalid Details", 400, "One or more ingredients not found.", true);
        }

        // Create recipe
        const newRecipe = await FeedFormulations.create({
            name,
            description,
            recipeGroupId: recipeGroup.uuid,
            target_animal_count,
            cost_per_kg,
            nutritional_notes,
            is_default,
            farmId,
            createdBy: userId,
            updatedBy: userId
        }, { transaction });

        // Create recipe ingredients (proportions stored as quantity)
        const formattedIngredients = ingredients.map(ingredient => ({
            formulation_name: name,
            formulationId: newRecipe.uuid,
            itemId: ingredient.stockItemId,
            quantity: parseFloat(ingredient.quantity),
            farmId
        }));

        await FeedFormulationItems.bulkCreate(formattedIngredients, { transaction });

        await transaction.commit();

        // Fetch complete recipe with ingredients for response
        const completeRecipe = await FeedFormulations.findOne({
            where: { uuid: newRecipe.uuid },
            include: [
                {
                    model: RecipeGroup,
                    as: "recipeGroup",
                    attributes: ["uuid", "name", "animal_category", "nutritional_focus"]
                },
                {
                    model: FeedFormulationItems,
                    as: "items",
                    where: { isDeleted: false },
                    required: false,
                    include: [
                        {
                            model: StockItem,
                            as: "stockItem",
                            attributes: ["uuid", "name", "description", "unit_of_measure"]
                        }
                    ]
                }
            ]
        });

        return sendSuccessResponse(res, 201, true, "Feed recipe created successfully.", "recipe", {
            uuid: completeRecipe.uuid,
            name: completeRecipe.name,
            description: completeRecipe.description,
            target_animal_count: completeRecipe.target_animal_count,
            cost_per_kg: completeRecipe.cost_per_kg,
            nutritional_notes: completeRecipe.nutritional_notes,
            is_default: completeRecipe.is_default,
            recipeGroup: completeRecipe.recipeGroup,
            ingredients: (completeRecipe.items || []).map(ing => ({
                uuid: ing.uuid,
                quantity: ing.quantity,
                ingredient: ing.stockItem
                    ? {
                        uuid: ing.stockItem.uuid,
                        name: ing.stockItem.name,
                        description: ing.stockItem.description,
                        unit: ing.stockItem.unit_of_measure
                    }
                    : null
            })),
            createdAt: completeRecipe.createdAt
        });
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};

export default CreateRecipe;