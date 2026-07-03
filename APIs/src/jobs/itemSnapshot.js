import cron from "node-cron";
import logger from "../logger/index.js";
import Snapshots from "../models/snapshot.js";
import StockLevel from "../models/stockLevel.js";
import StockItems from "../models/stockItem.js";

async function cronJob() {
    try {
        const today = new Date();
        const snapshotDate = new Date(today.getFullYear(), today.getMonth(), 0);
        const snapshotFor = snapshotDate.toISOString().split("T")[0];

        const include = [
            {
                model: StockLevel,
                as: "stockLevel",
                attributes: ["uuid", "quantity", "price"],
                required: false,
            },
        ];
        const items = await StockItems.findAll({ where: { isDeleted: false }, include, raw: true });
        const snapshots = [];
        for (const item of items) {
            const { farmId, uuid: itemId, "stockLevel.quantity": quantity, "stockLevel.price": price, categoryId } = item;
            snapshots.push({
                itemId,
                farmId,
                date: snapshotFor,
                categoryId,
                quantity,
                avg_price: price,
            });
        }
        await Snapshots.bulkCreate(snapshots);
    } catch (error) {
        logger.error(`Cron Job :: ${error.message}`);
    }
}
let SnapshotsJob;
try {
     SnapshotsJob = cron.schedule("0 1 1 * *", cronJob);
}
catch (err) {
    logger.error(`Cron Job 2 :: ${err.message}`);
}

export default SnapshotsJob;
