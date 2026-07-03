import sequelize from "../../config/db.js";
import { AnimalEvents, PregnancyStatuses, TransactionTypes } from "../../constants/index.js";
import aiBreedingEvent from "../../models/aiBreeding.js";
import Animal from "../../models/animal.js";
import PregnancyStatus from "../../models/pregnancyStatus.js";
import StockItems from "../../models/stockItem.js";
import StockLevel from "../../models/stockLevel.js";
import StockTransactions from "../../models/stockTransactions.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import { assertBreedingEligible } from "../../utils/herd/animalHelpers.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";

const AiBreedingEvent = async (req, res, next) => {
    let transaction;
    try {
        const { body: { tech, comments, semen, cost, type, dose, double_dose, weight, date, time, animalId, semenStockItemId }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        const animal = await Animal.findOne({ where: { uuid: animalId, farmId, isDeleted: false }, raw: true });
        if (!animal) throw new ApiError("Invalid Details", 400, "Animal with the provided animalId does not exist.", true);
        assertBreedingEligible(animal, ApiError);

        // Optional: deduct semen straws from inventory (straw count = dose).
        let semenItem = null;
        let semenLevel = null;
        const strawsUsed = Number(dose) || 1;
        if (semenStockItemId) {
            semenItem = await StockItems.findOne({ where: { uuid: semenStockItemId, farmId, isDeleted: false }, raw: true });
            if (!semenItem) throw new ApiError("Invalid Details", 400, "Semen stock item not found on this farm.", true);
            semenLevel = await StockLevel.findOne({ where: { itemId: semenStockItemId, farmId, isDeleted: false }, raw: true });
            if (!semenLevel || Number(semenLevel.quantity) < strawsUsed) {
                throw new ApiError("Invalid Details", 400, `Insufficient semen straws for ${semenItem.name}. Available: ${semenLevel ? semenLevel.quantity : 0}, required: ${strawsUsed}.`, true);
            }
        }

        const eventPayload = {
            tech: tech?.toLowerCase(),
            comments,
            farmId,
            semen: semen || semenItem?.name,
            cost,
            type,
            dose,
            double_dose,
            weight,
            date,
            time,
            animalId,
        };
        transaction = await sequelize.transaction();
        const event = await aiBreedingEvent.create(eventPayload, { transaction });
        if (semenStockItemId) {
            await StockLevel.decrement({ quantity: strawsUsed }, { where: { itemId: semenStockItemId, farmId }, transaction });
            await StockTransactions.create({
                farmId,
                itemId: semenStockItemId,
                item_name: semenItem.name,
                note: `Semen used for AI breeding of ${animal.tagName || animalId}`,
                last_quantity: Number(semenLevel.quantity),
                quantity: strawsUsed,
                reference: event.uuid,
                date,
                transaction_type: TransactionTypes.USAGE,
                price: Number(semenLevel.price) || 0,
                createdBy: userId,
            }, { transaction });
        }
        const [pregStatus, created] = await PregnancyStatus.findOrCreate({
            where: { animalId },
            defaults: { status: PregnancyStatuses.INSAMINATED, animalId },
            raw: true,
            transaction,
        });
        const animalUpdateQuery = {
            inseminated_date: date,
            pregnancy_status: PregnancyStatuses.INSAMINATED,
            last_event: AnimalEvents.AI_BREEDING,
        }
        if (created) animalUpdateQuery.pregnancyStatusId = pregStatus.uuid;
        else {
            await PregnancyStatus.update({ status: PregnancyStatuses.INSAMINATED }, { where: { animalId }, transaction });
        }
        await Animal.update(animalUpdateQuery, { where: { uuid: animalId, farmId }, transaction });
        await transaction.commit();
        return sendSuccessResponse(res, 200, true, "Ai Breeding event register successfully.", "breeding-event", event);
    } catch (error) {
        if (transaction) await transaction.rollback();
        next(error);
    }
};
export default AiBreedingEvent;
