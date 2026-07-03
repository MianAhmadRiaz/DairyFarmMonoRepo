import Animal from "../../models/animal.js";
import MilkIn from "../../models/milk.js";
import MilkingSession from "../../models/milkingSession.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";

const UpdateMilkingSession = async (req, res, next) => {
    try {
        const { body: { animalId, date, milkingTime, milk }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        const checkAnimal = await Animal.findOne({ where: { uuid: animalId, farmId, isDeleted: false }, raw: true });
        if (!checkAnimal) throw new ApiError("Invalid Details", 400, "Animal not found with provided animalId", true);
        if (checkAnimal.gender !== "female") throw new ApiError("Invalid Details", 400, "Milk production is only applicable to female animals.", true);
        const checkSessionDataAlreadyApproved = await MilkIn.findOne({ where: { animalId, date }, raw: true });
        if (checkSessionDataAlreadyApproved) throw new ApiError("Invalid Details", 400, "Animal milk session already approved so can not be updated.", true);
        const checkSessionData = await MilkingSession.findOne({ where: { animalId, milkingTime, date } });
        if (!checkSessionData) throw new ApiError("Invalid Details", 400, "Milk session not found.", true);
        await MilkingSession.update({ milk }, { where: { animalId, milkingTime, date } });
        return sendSuccessResponse(res, 200, true, "animal milk session update successfully.", "milk");
    } catch (error) {
        next(error);
    }
    return UpdateMilkingSession;
};
export default UpdateMilkingSession;
