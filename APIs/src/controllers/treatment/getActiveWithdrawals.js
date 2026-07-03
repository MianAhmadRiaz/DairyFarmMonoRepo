import { Op } from "sequelize";
import Animal from "../../models/animal.js";
import Treatment from "../../models/treatment.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";

// Animals currently under milk or meat withdrawal — the food-safety hot list.
const GetActiveWithdrawals = async (req, res, next) => {
    try {
        const { userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);

        const today = new Date().toISOString().split("T")[0];
        const withdrawals = await Treatment.findAll({
            where: {
                farmId,
                isDeleted: false,
                [Op.or]: [
                    { milkWithdrawalUntil: { [Op.gte]: today } },
                    { meatWithdrawalUntil: { [Op.gte]: today } },
                ],
            },
            include: [{ model: Animal, as: "animal", attributes: ["uuid", "tagName", "name", "animalCategory"] }],
            order: [["milkWithdrawalUntil", "DESC"]],
        });
        return sendSuccessResponse(res, 200, true, "active withdrawals fetched successfully.", "withdrawals", withdrawals);
    } catch (error) {
        next(error);
    }
};
export default GetActiveWithdrawals;
