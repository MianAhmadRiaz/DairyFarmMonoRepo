import { Op } from "sequelize";
import StockItems from "../../models/stockItem.js";
import StockLevel from "../../models/stockLevel.js";
import StockCategories from "../../models/stockCategories.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";

const GetFeedIngredients = async (req, res, next) => {
    try {
        const { query: { limit = 50, page = 1, type = 'feed' }, userId } = req;
        const offset = (page - 1) * limit;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);

        let where = { isDeleted: false, farmId };
        
        // Filter by feed-related categories
        if (type === 'feed') {
            const feedCategories = await StockCategories.findAll({
                where: {
                    farmId,
                    isDeleted: false,
                    name: {
                        [Op.iLike]: '%feed%'
                    }
                },
                attributes: ['uuid']
            });

            if (feedCategories.length > 0) {
                const categoryIds = feedCategories.map(cat => cat.uuid);
                where.categoryId = { [Op.in]: categoryIds };
            }
        }

        const include = [
            {
                model: StockLevel,
                as: "stockLevel",
                attributes: ["uuid", "quantity", "price"],
                required: false,
            },
            {
                model: StockCategories,
                as: "category",
                attributes: ["uuid", "name"],
                required: false,
            }
        ];

        const { count, rows: ingredients } = await StockItems.findAndCountAll({
            where,
            include,
            offset,
            limit,
            order: [["name", "ASC"]],
        });

        // Format response with availability status
        const formattedIngredients = ingredients.map(ingredient => {
            const stockLevel = ingredient.stockLevel;
            return {
                ...ingredient.toJSON(),
                isAvailable: stockLevel ? stockLevel.quantity > 0 : false,
                currentStock: stockLevel ? stockLevel.quantity : 0,
                unitPrice: stockLevel ? stockLevel.price : 0,
                category: ingredient.category
            };
        });

        const totalPages = Math.ceil(count / limit);
        const responseData = {
            ingredients: formattedIngredients,
            page: Number(page),
            totalPages: Number(totalPages),
            limit: Number(limit),
            skip: offset,
            totalCount: Number(count),
        };
        
        return sendSuccessResponse(res, 200, true, "Feed ingredients fetched successfully.", "ingredients", responseData);
    } catch (error) {
        next(error);
    }
};

export default GetFeedIngredients;