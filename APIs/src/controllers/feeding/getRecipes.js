import FeedFormulations from "../../models/feedFormulation.js";
import FeedFormulationItems from "../../models/feedFormulationItems.js";
import RecipeGroup from "../../models/recipeGroup.js";
import StockItem from "../../models/stockItem.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../utils/uuidValidator.js";

const GetRecipes = async (req, res, next) => {
    try {
        const { 
            query: { 
                limit = 20, 
                page = 1, 
                recipeId, 
                groupId, 
                animal_category,
                is_default 
            }, 
            userId 
        } = req;
        
        const offset = (page - 1) * limit;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);

        // If specific recipe requested
        if (isValidUUID(recipeId)) {
            const recipe = await FeedFormulations.findOne({
                where: { uuid: recipeId, farmId, isDeleted: false },
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
            
            if (!recipe) {
                throw new ApiError("Invalid Details", 400, "Recipe not found with provided recipeId", true);
            }

            const formattedRecipe = {
                uuid: recipe.uuid,
                name: recipe.name,
                description: recipe.description,
                target_animal_count: recipe.target_animal_count,
                cost_per_kg: recipe.cost_per_kg,
                nutritional_notes: recipe.nutritional_notes,
                is_default: recipe.is_default,
                recipeGroup: recipe.recipeGroup,
                ingredients: recipe.items?.map(ing => ({
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
                })) || [],
                totalIngredients: recipe.items?.length || 0,
                createdAt: recipe.createdAt,
                updatedAt: recipe.updatedAt
            };
            
            return sendSuccessResponse(res, 200, true, "Recipe fetched successfully.", "recipe", formattedRecipe);
        }

        // Build where conditions for filtering
        const whereConditions = { isDeleted: false, farmId };

        if (groupId && isValidUUID(groupId)) {
            const group = await RecipeGroup.findOne({
                where: { uuid: groupId, farmId, isDeleted: false }
            });
            if (group) {
                whereConditions.recipeGroupId = group.uuid;
            }
        }

        if (is_default !== undefined) {
            whereConditions.is_default = is_default === 'true';
        }

        // Include conditions for recipe group filtering
        const includeConditions = [
            {
                model: RecipeGroup,
                as: "recipeGroup",
                attributes: ["uuid", "name", "animal_category", "nutritional_focus"],
                where: animal_category ? { animal_category } : {}
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
        ];

        const { count, rows: recipes } = await FeedFormulations.findAndCountAll({
            where: whereConditions,
            offset,
            limit,
            order: [["name", "ASC"], ["createdAt", "DESC"]],
            include: includeConditions
        });

        // Format recipes response
        const formattedRecipes = recipes.map(recipe => ({
            uuid: recipe.uuid,
            name: recipe.name,
            description: recipe.description,
            target_animal_count: recipe.target_animal_count,
            cost_per_kg: recipe.cost_per_kg,
            nutritional_notes: recipe.nutritional_notes,
            is_default: recipe.is_default,
            recipeGroup: recipe.recipeGroup,
            ingredientsCount: recipe.items?.length || 0,
            costPerKg: recipe.cost_per_kg || 0,
            createdAt: recipe.createdAt,
            updatedAt: recipe.updatedAt
        }));

        const totalPages = Math.ceil(count / limit);
        const responseData = {
            recipes: formattedRecipes,
            page: Number(page),
            totalPages: Number(totalPages),
            limit: Number(limit),
            skip: offset,
            totalCount: Number(count),
        };
        
        return sendSuccessResponse(res, 200, true, "Recipes fetched successfully.", "recipes", responseData);
    } catch (error) {
        next(error);
    }
};

export default GetRecipes;