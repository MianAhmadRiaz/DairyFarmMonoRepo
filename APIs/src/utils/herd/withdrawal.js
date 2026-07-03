import { Op } from "sequelize";
import Treatment from "../../models/treatment.js";

// Returns the active milk-withdrawal treatment for an animal (or null).
// The milk module uses this to block milk from treated animals entering the tank.
const getActiveMilkWithdrawal = async (animalId, onDate = new Date()) => {
    const date = new Date(onDate).toISOString().split("T")[0];
    return Treatment.findOne({
        where: {
            animalId,
            isDeleted: false,
            milkWithdrawalUntil: { [Op.gte]: date },
        },
        order: [["milkWithdrawalUntil", "DESC"]],
        raw: true,
    });
};

// All animals of a farm currently under milk withdrawal.
const getAnimalsUnderMilkWithdrawal = async (farmId, onDate = new Date()) => {
    const date = new Date(onDate).toISOString().split("T")[0];
    const rows = await Treatment.findAll({
        where: {
            farmId,
            isDeleted: false,
            milkWithdrawalUntil: { [Op.gte]: date },
        },
        attributes: ["animalId", "milkWithdrawalUntil", "medicineName", "treatmentType"],
        raw: true,
    });
    return rows;
};

export { getActiveMilkWithdrawal, getAnimalsUnderMilkWithdrawal };
