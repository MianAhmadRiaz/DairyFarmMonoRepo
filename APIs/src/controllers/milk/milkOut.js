
import convertToRequiredDecimalPlaces from "../../utils/convertToRequiredDecimalPlaces.js";
import sequelize from "../../config/db.js";
import { MilkOutTypes } from "../../constants/index.js";
import Companies from "../../models/companies.js";
import FinalMilk from "../../models/finalMilk.js";
import MilkOut from "../../models/milkOut.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../utils/uuidValidator.js";
import MilkCategories from "../../models/milkCategories.js";
import { recordMilkSale } from "../../utils/finance/financeHooks.js";

const Milkout = async (req, res, next) => {
    let transaction;
    try {
        const { userId, body: { pricePerLitre, volume, categoryId, outType, companyId, date, fat, snf, adj_volume, remarks, animalId } } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        const finalMilk = await FinalMilk.findOne({ where: { farmId }, raw: true });
        if (!finalMilk) throw new ApiError("Unauthorized", 400, "Milk not found.", true);
        if (Number(finalMilk.milk) < Number(volume)) throw new ApiError("Unauthorized", 400, "The requested quantity of milk is not available in the milk tank.", true);

        const isSale = outType === MilkOutTypes.SELL;
        // A sale without a price is unaccountable revenue — refuse it.
        if (isSale && !(Number(pricePerLitre) > 0)) {
            throw new ApiError("Invalid Details", 400, "pricePerLitre is required and must be greater than 0 when outType is sell.", true);
        }
        if (isSale && companyId) {
            if (!isValidUUID(companyId)) throw new ApiError("Invalid Details", 400, "Please provide a valid companyId.", true);
            const company = await Companies.findOne({ where: { uuid: companyId, farmId }, raw: true });
            if (!company) throw new ApiError("Invalid Details", 400, "Company not found with provided companyId.", true);
        }
        if (categoryId && !isValidUUID(categoryId)) throw new ApiError("Invalid Details", 400, "Please provide a valid milk categoryId.", true);
        if (isValidUUID(categoryId)) {
            const category = await MilkCategories.findOne({ where: { uuid: categoryId, farmId, isDeleted: false }, raw: true });
            if (!category) throw new ApiError("Invalid Details", 400, "Milk category not found with provided categoryId", true);
        };

        const milkoutData = {
            approvedBy: userId,
            farmId,
            date,
            volume: Number(volume),
            outType,
            companyId: companyId || null,
            categoryId: categoryId || null,
            animalId: animalId || null,
            fat: fat ?? null,
            snf: snf ?? null,
            adj_volume: adj_volume ?? null,
            remarks,
            pricePerLitre: isSale ? Number(pricePerLitre) : (Number(pricePerLitre) || null),
            totalPrice: isSale ? convertToRequiredDecimalPlaces(Number(pricePerLitre) * Number(volume), 2) : null,
        };
        transaction = await sequelize.transaction();
        const milkOut = await MilkOut.create(milkoutData, { transaction });
        await FinalMilk.decrement({ milk: convertToRequiredDecimalPlaces(volume, 4) }, { where: { farmId }, transaction });
        await transaction.commit();
        // Finance automation: record the milk sale as income (non-blocking, sales only)
        if (isSale && milkoutData.totalPrice > 0) {
            await recordMilkSale({
                farmId,
                userId,
                amount: milkoutData.totalPrice,
                referenceId: milkOut.uuid,
                description: `Milk sale - ${volume} L @ ${milkoutData.pricePerLitre}/L`,
                date,
            });
        }
        return sendSuccessResponse(res, 200, true, "Milkout record add successfully.", "milk", milkOut);
    } catch (error) {
        if (transaction) await transaction.rollback();
        next(error);
    }
};
export default Milkout;
