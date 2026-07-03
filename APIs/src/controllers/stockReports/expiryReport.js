import { Op } from "sequelize";
import PurchaseItems from "../../models/purchaseItem.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";

// Batches expiring within `days` (default 60) or already expired — the
// medicine/semen shelf-life watchlist.
const ExpiryReport = async (req, res, next) => {
    try {
        const { query: { days = 60 }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);

        const horizon = new Date();
        horizon.setDate(horizon.getDate() + Number(days));
        const horizonStr = horizon.toISOString().split("T")[0];
        const todayStr = new Date().toISOString().split("T")[0];

        const batches = await PurchaseItems.findAll({
            where: {
                farmId,
                isDeleted: false,
                expiry_date: { [Op.ne]: null, [Op.lte]: horizonStr },
            },
            attributes: ["uuid", "itemId", "item_name", "supplier_name", "quantity", "batch_number", "expiry_date", "date"],
            order: [["expiry_date", "ASC"]],
            raw: true,
        });

        const expired = batches.filter((b) => b.expiry_date < todayStr);
        const expiringSoon = batches.filter((b) => b.expiry_date >= todayStr);

        return sendSuccessResponse(res, 200, true, "expiry report fetched successfully.", "expiryReport", {
            days: Number(days),
            expired,
            expiringSoon,
            counts: { expired: expired.length, expiringSoon: expiringSoon.length },
        });
    } catch (error) {
        next(error);
    }
};

export default ExpiryReport;
