import express from "express";
import { createUser, deleteUser, getUserList, updateUserRole } from "../controllers/admin/user/index.js";
import { getLogs, updateFarmDetails } from "../controllers/admin/farm/index.js";
import checkPermission from "../middlewares/checkPermission.js";
import { PERMISSIONS } from "../constants/rbac.js";

const router = express.Router();

// Farm user management + farm settings, gated by RBAC permissions (Owner bypasses).
router.get("/user", checkPermission(PERMISSIONS.USER_VIEW), getUserList);
router.post("/user", checkPermission(PERMISSIONS.USER_MANAGE), createUser);
router.put("/user", checkPermission(PERMISSIONS.USER_MANAGE), updateUserRole);
router.delete("/user", checkPermission(PERMISSIONS.USER_MANAGE), deleteUser);
router.put("/farm", checkPermission(PERMISSIONS.FARM_SETTINGS), updateFarmDetails);
router.get("/logs", checkPermission(PERMISSIONS.FARM_SETTINGS), getLogs);

export default router;
