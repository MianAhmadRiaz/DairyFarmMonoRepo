import express from "express";
import systemAdminCheckPermission from "../../middlewares/systemAdminCheckPermission.js";
import { SystemAdminPermissions } from "../../constants/index.js";
import { approveOrRejectFarm, blockUnblockFarm, DeleteFarm, getFarmsList } from "../../controllers/softwareAdmin/farm/index.js";
import { revokeFarm, setFarmDiscount } from "../../controllers/softwareAdmin/farm/farmControls.js";
import { impersonateFarm, getFarmUsage } from "../../controllers/softwareAdmin/farm/impersonateFarm.js";
import createFarm from "../../controllers/softwareAdmin/farm/createFarm.js";

const router = express.Router();

const canManage = systemAdminCheckPermission(SystemAdminPermissions.manageFarms);
const canImpersonate = systemAdminCheckPermission(SystemAdminPermissions.impersonateFarm);

router.get("/",  getFarmsList);
router.post("/", canManage, createFarm);
router.put("/",  approveOrRejectFarm);
router.put("/block-unblock",  blockUnblockFarm);
router.delete("/",  DeleteFarm);

// Hard revoke / restore, per-farm discount, usage, impersonation
router.put("/revoke", canManage, revokeFarm);
router.put("/discount", canManage, setFarmDiscount);
router.get("/usage", getFarmUsage);
router.post("/impersonate", canImpersonate, impersonateFarm);

export default router;
