import Animal from "../../models/animal.js";
import MilkingSession from "../../models/milkingSession.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import { getActiveMilkWithdrawal } from "../../utils/herd/withdrawal.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";

const AddMilkingSession = async (req, res, next) => {
    try {
        const { body: { animalId, date, milkingTime, milk, tagUser, remarks }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        const checkAnimal = await Animal.findOne({ where: { uuid: animalId, farmId, isDeleted: false }, raw: true });
        if (!checkAnimal) throw new ApiError("Invalid Details", 400, "Animal not found with provided uuid", true);
        if (checkAnimal.gender !== "female") throw new ApiError("Invalid Details", 400, "Milk production is only applicable to female animals.", true);
        const checkSessionData = await MilkingSession.findOne({ where: { animalId, milkingTime, date } });
        if (checkSessionData) throw new ApiError("Invalid Details", 400, "Session already submitted.", true);
        const sessionData = {
            milkedBy: userId,
            animalId,
            date,
            milkingTime,
            milk,
            tagUser,
            remarks,
        }
        const session = await MilkingSession.create(sessionData);
        // Food safety: surface an active milk withdrawal so the UI can warn the
        // milker that this animal's milk must be kept out of the tank.
        const withdrawal = await getActiveMilkWithdrawal(animalId, date);
        const responseData = {
            ...session.toJSON(),
            underMilkWithdrawal: Boolean(withdrawal),
            milkWithdrawalUntil: withdrawal?.milkWithdrawalUntil || null,
        };
        const message = withdrawal
            ? `Session recorded. WARNING: this animal is under milk withdrawal until ${withdrawal.milkWithdrawalUntil} — its milk must not be sold or added to the tank.`
            : "animal milk session add successfully.";
        return sendSuccessResponse(res, 200, true, message, "milk", responseData);
    } catch (error) {
        next(error);
    }
};
export default AddMilkingSession;
