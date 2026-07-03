import convertToRequiredDecimalPlaces from "../../utils/convertToRequiredDecimalPlaces.js";
import sequelize from "../../config/db.js";
import FinalMilk from "../../models/finalMilk.js";
import Milk from "../../models/milk.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import { getAnimalsUnderMilkWithdrawal } from "../../utils/herd/withdrawal.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import MilkIn from "../../models/milk.js";

const addFinalMilk = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
        const { body: { sessionsData }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        if (!Array.isArray(sessionsData) || sessionsData.length === 0) throw new ApiError("Unauthorized", 400, "Please provide milk sessions data.", true);

        // Food safety: milk from animals under an active milk withdrawal must not
        // enter the tank. Reject the approval batch and tell the user which animals
        // to exclude (their milk should be recorded as dumped via milk-out).
        const withdrawals = await getAnimalsUnderMilkWithdrawal(farmId);
        if (withdrawals.length > 0) {
            const withdrawalByAnimal = new Map(withdrawals.map((w) => [w.animalId, w]));
            const blocked = sessionsData.filter((s) => withdrawalByAnimal.has(s.uuid));
            if (blocked.length > 0) {
                const details = blocked
                    .map((s) => {
                        const w = withdrawalByAnimal.get(s.uuid);
                        return `${s.tagName || s.uuid} (withdrawal until ${w.milkWithdrawalUntil})`;
                    })
                    .join(", ");
                throw new ApiError("Invalid Details", 400, `Milk from animals under treatment withdrawal cannot be approved into the tank: ${details}. Remove them from the batch — their milk must be dumped.`, true);
            }
        }

        let totalAddMilk = 0;
        const milkDataPromises = sessionsData.map(async (session) => {
            const { uuid, penId, lactation, sessions, milkiQuality = "b", date } = session;
            const checkIfMilkAllreadyApproved = await MilkIn.findOne({ where: { animalId: uuid, farmId, date, isDeleted: false }, raw: true });
            if (checkIfMilkAllreadyApproved) {
                return null
            }
            const milk1 = convertToRequiredDecimalPlaces(sessions[0]?.milk) || 0;
            const milk2 = convertToRequiredDecimalPlaces(sessions[1]?.milk) || 0;
            const milk3 = convertToRequiredDecimalPlaces(sessions[2]?.milk) || 0;
            const totalMilk = convertToRequiredDecimalPlaces(Number(milk1 + milk2 + milk3)) || 0;
            totalAddMilk = totalAddMilk + totalMilk;
            return {
                animalId: uuid,
                farmId,
                animal_curr_lactation: lactation,
                penId,
                date,
                milk1,
                milk2,
                milk3,
                totalMilk,
                milkiQuality,
                approvedBy: userId,
            }
        })
        const milkData = await Promise.all(milkDataPromises);
        const finalMilkData = milkData.filter(data => data !== null);
        if (finalMilkData.length < 1) throw new ApiError("Invalid Details", 400, "All provide milk sessions data already approved.", true);

        const milk = await Milk.bulkCreate(finalMilkData, { transaction });
        await FinalMilk.increment({ milk: convertToRequiredDecimalPlaces(totalAddMilk, 4) }, { where: { farmId }, transaction });
        await transaction.commit();
        const response = {
            approvedMilk: milk,
        }
        return sendSuccessResponse(res, 200, true, "animals milk approved and add successfully.", "milk", response);
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
    return addFinalMilk;
};
export default addFinalMilk;
