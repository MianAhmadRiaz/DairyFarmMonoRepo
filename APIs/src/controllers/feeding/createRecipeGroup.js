import RecipeGroup from "../../models/recipeGroup.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";

const CreateRecipeGroup = async (req, res, next) => {
    try {
        const { userId, body: { name, description, animal_category, nutritional_focus } } = req;
        
        if (!name || !animal_category) {
            throw new ApiError("Invalid Details", 400, "Name and animal category are required.", true);
        }

        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);

        // Check if recipe group with same name exists in the farm
        const existingGroup = await RecipeGroup.findOne({
            where: { 
                name, 
                farmId, 
                isDeleted: false 
            }
        });

        if (existingGroup) {
            throw new ApiError("Invalid Details", 400, "Recipe group with this name already exists.", true);
        }

        // Validate against the DB enum values (recipeGroup model)
        const validCategories = ['lactating_cows', 'dry_cows', 'heifers', 'calves', 'bulls', 'pregnant_cows', 'fresh_cows', 'high_producing', 'maintenance'];
        if (!validCategories.includes(animal_category)) {
            throw new ApiError("Invalid Details", 400, `Invalid animal category. Must be one of: ${validCategories.join(", ")}.`, true);
        }

        // Validate nutritional_focus enum if provided
        if (nutritional_focus) {
            const validFocus = ['high_protein', 'high_energy', 'maintenance', 'growth', 'reproduction', 'milk_production', 'weight_gain'];
            if (!validFocus.includes(nutritional_focus)) {
                throw new ApiError("Invalid Details", 400, `Invalid nutritional focus. Must be one of: ${validFocus.join(", ")}.`, true);
            }
        }

        const newGroup = await RecipeGroup.create({
            name,
            description,
            animal_category,
            nutritional_focus,
            farmId,
            createdBy: userId,
            updatedBy: userId
        });

        return sendSuccessResponse(res, 201, true, "Recipe group created successfully.", "recipeGroup", {
            uuid: newGroup.uuid,
            name: newGroup.name,
            description: newGroup.description,
            animal_category: newGroup.animal_category,
            nutritional_focus: newGroup.nutritional_focus,
            createdAt: newGroup.createdAt
        });
    } catch (error) {
        next(error);
    }
};

export default CreateRecipeGroup;