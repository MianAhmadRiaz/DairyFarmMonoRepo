import { Op } from "sequelize";
import TransactionCategory from "../../models/transactionCategory.js";
import { getFarmContext, ensureFinanceSetup } from "../../repo/finance.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";

// GET /finance/categories
export const GetCategories = async (req, res, next) => {
    try {
        const { query: { categoryType, search }, userId } = req;
        const { farmId } = await getFarmContext(userId);
        await ensureFinanceSetup(farmId, userId);

        const where = { farmId };
        if (categoryType) where.category_type = categoryType;
        if (search) where.name = { [Op.iLike]: `%${search}%` };

        const categories = await TransactionCategory.findAll({ where, order: [["name", "ASC"]] });
        return sendSuccessResponse(res, 200, true, "Categories fetched successfully.", "transaction-categories", { categories });
    } catch (error) {
        next(error);
    }
};

// POST /finance/categories
export const CreateCategory = async (req, res, next) => {
    try {
        const { body, userId } = req;
        const { farmId } = await getFarmContext(userId);
        await ensureFinanceSetup(farmId, userId);

        const { name, code, category_type, parent_id, description } = body;
        if (!name || !category_type) throw new ApiError("Validation error", 400, "name and category_type are required", true);

        const category = await TransactionCategory.create({
            name,
            code: code || name.toUpperCase().replace(/\s+/g, "_"),
            category_type,
            parent_id: parent_id || null,
            description: description || null,
            farmId,
            createdBy: userId,
        });
        return sendSuccessResponse(res, 201, true, "Category created successfully.", "transaction-categories", category);
    } catch (error) {
        next(error);
    }
};

// PUT /finance/categories/:id
export const UpdateCategory = async (req, res, next) => {
    try {
        const { params: { id }, body, userId } = req;
        const { farmId } = await getFarmContext(userId);
        const category = await TransactionCategory.findOne({ where: { id, farmId } });
        if (!category) throw new ApiError("Not found", 404, "Category not found", true);
        await category.update({
            name: body.name ?? category.name,
            category_type: body.category_type ?? category.category_type,
            parent_id: body.parent_id ?? category.parent_id,
            description: body.description ?? category.description,
        });
        return sendSuccessResponse(res, 200, true, "Category updated successfully.", "transaction-categories", category);
    } catch (error) {
        next(error);
    }
};

// DELETE /finance/categories/:id
export const DeleteCategory = async (req, res, next) => {
    try {
        const { params: { id }, userId } = req;
        const { farmId } = await getFarmContext(userId);
        const category = await TransactionCategory.findOne({ where: { id, farmId } });
        if (!category) throw new ApiError("Not found", 404, "Category not found", true);
        await category.destroy();
        return sendSuccessResponse(res, 200, true, "Category deleted successfully.", "transaction-categories", { id });
    } catch (error) {
        next(error);
    }
};
