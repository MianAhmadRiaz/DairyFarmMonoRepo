import sequelize from "../../config/db.js";
import { TransactionTypes } from "../../constants/index.js";
import Animal from "../../models/animal.js";
import HealthStatusHistory from "../../models/healthStatusHistory.js";
import StockItems from "../../models/stockItem.js";
import StockLevel from "../../models/stockLevel.js";
import StockTransactions from "../../models/stockTransactions.js";
import Treatment from "../../models/treatment.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import { recordVetExpense } from "../../utils/finance/financeHooks.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";

const addDays = (date, days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + Number(days));
    return d.toISOString().split("T")[0];
};

const AddTreatment = async (req, res, next) => {
    let transaction;
    try {
        const {
            body: {
                animalId, date, treatmentType, diagnosis, medicineName, medicineStockItemId,
                quantityUsed, dosage, vetName, cost, milkWithdrawalDays, meatWithdrawalDays,
                markSick, comments,
            },
            userId,
        } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        const animal = await Animal.findOne({ where: { uuid: animalId, farmId, isDeleted: false }, raw: true });
        if (!animal) throw new ApiError("Invalid Details", 400, "Animal with the provided animalId does not exist.", true);

        const treatmentPayload = {
            farmId,
            animalId,
            date,
            treatmentType,
            diagnosis,
            medicineName,
            dosage,
            vetName,
            cost: cost || 0,
            milkWithdrawalDays: milkWithdrawalDays || 0,
            meatWithdrawalDays: meatWithdrawalDays || 0,
            milkWithdrawalUntil: milkWithdrawalDays > 0 ? addDays(date, milkWithdrawalDays) : null,
            meatWithdrawalUntil: meatWithdrawalDays > 0 ? addDays(date, meatWithdrawalDays) : null,
            comments,
            createdBy: userId,
        };

        // Optional medicine stock deduction: validate before opening the transaction.
        let stockItem = null;
        let stockLevel = null;
        const deductStock = medicineStockItemId && Number(quantityUsed) > 0;
        if (deductStock) {
            stockItem = await StockItems.findOne({ where: { uuid: medicineStockItemId, farmId, isDeleted: false }, raw: true });
            if (!stockItem) throw new ApiError("Invalid Details", 400, "Medicine stock item not found on this farm.", true);
            stockLevel = await StockLevel.findOne({ where: { itemId: medicineStockItemId, farmId }, raw: true });
            if (!stockLevel || Number(stockLevel.quantity) < Number(quantityUsed)) {
                throw new ApiError("Invalid Details", 400, `Insufficient stock for ${stockItem.name}. Available: ${stockLevel ? stockLevel.quantity : 0}.`, true);
            }
            treatmentPayload.medicineStockItemId = medicineStockItemId;
            treatmentPayload.quantityUsed = Number(quantityUsed);
            if (!treatmentPayload.medicineName) treatmentPayload.medicineName = stockItem.name;
        }

        transaction = await sequelize.transaction();
        const treatment = await Treatment.create(treatmentPayload, { transaction });

        if (deductStock) {
            await StockLevel.decrement({ quantity: Number(quantityUsed) }, { where: { itemId: medicineStockItemId, farmId }, transaction });
            await StockTransactions.create({
                farmId,
                itemId: medicineStockItemId,
                item_name: stockItem.name,
                note: `Medicine used for treatment of animal ${animal.tagName || animalId}`,
                last_quantity: Number(stockLevel.quantity),
                quantity: Number(quantityUsed),
                reference: treatment.uuid,
                date,
                transaction_type: TransactionTypes.USAGE,
                price: Number(stockLevel.price) || 0,
                createdBy: userId,
            }, { transaction });
        }

        if (markSick) {
            await HealthStatusHistory.create({
                createdBy: userId,
                healthStatus: "sick",
                date,
                animalId,
            }, { transaction });
            await Animal.update({ healthStatus: "sick" }, { where: { uuid: animalId, farmId }, transaction });
        }

        await transaction.commit();

        // Finance automation: vet/medicine expense (non-blocking, post-commit)
        if (Number(cost) > 0) {
            await recordVetExpense({
                farmId,
                userId,
                amount: Number(cost),
                referenceId: treatment.uuid,
                description: `${treatmentType} - animal ${animal.tagName || animalId}`,
                date,
            });
        }
        return sendSuccessResponse(res, 200, true, "treatment recorded successfully.", "treatment", treatment);
    } catch (error) {
        if (transaction) await transaction.rollback();
        next(error);
    }
};
export default AddTreatment;
