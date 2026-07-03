import EventEmitter from "events";
import { DefaultStockCategories, EventTypes } from "../../constants/index.js";
import logger from "../../logger/index.js";
import User from "../../models/user.js";
import LactationHistory from "../../models/animalLactationHistory.js";
import StockCategories from "../../models/stockCategories.js";
import FarmConfiguration from "../../models/farmConfiguration.js";
import Logs from "../../models/farmLogs.js";
import { seedFarmRoles } from "../../repo/rbac.js";

const Event = new EventEmitter();

Event.on(EventTypes.UpdateUserRole, async (payload) => {
    try {
        const { userId, farmId } = payload;
        // Seed the full dairy role set for the farm and assign the account
        // creator the non-deletable Owner role (full access).
        const ownerRole = await seedFarmRoles(farmId, userId);
        if (!ownerRole) {
            logger.error(`error seeding roles for farm ${farmId}`);
            return;
        }
        await User.update({ roleId: ownerRole.uuid, role_name: ownerRole.name }, { where: { uuid: userId } });
        await FarmConfiguration.create({ farmId });
        logger.info(`dairy roles seeded and Owner role attached to new user`);
    } catch (error) {
        logger.error(`update user role Event ${error.message}}`);
    }
});

Event.on(EventTypes.AddLactationHistory, async (payload) => {
    try {
        await LactationHistory.create(payload);
        logger.info(`lactation history added successfully.`);
    } catch (error) {
        logger.error(`lactation history Event ${error.message}}`);
    }
});

Event.on(EventTypes.AddDefaultCategories, async (payload) => {
    try {
        const { userId, farmId } = payload;
        const categoriesData = [
            {
                name: DefaultStockCategories.Feeding,
                description: "reference to feeding stock items.",
                farmId,
                createdBy: userId,
            },
            {
                name: DefaultStockCategories.Medicine,
                description: "reference to medicine stock items.",
                farmId,
                createdBy: userId,
            },
            {
                name: DefaultStockCategories.Semen,
                description: "reference to semen stock items.",
                farmId,
                createdBy: userId,
            },
        ];
        await StockCategories.bulkCreate(categoriesData);
        logger.info(`Default categories created for farmId :: ${farmId}`);
    } catch (error) {
        logger.error(`Default categories Event ${error.message}}`);
    }
});

Event.on(EventTypes.Logs, async (payload) => {
    try {
        const { message, farmId } = payload;
        await Logs.create({ message, farmId });
        logger.info(`Log store for farmId :: ${farmId}`);
    } catch (error) {
        logger.error(`Log event ${error.message}}`);
    }
});
export default Event;
