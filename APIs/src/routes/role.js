import express from "express";
import { createRole, getRoles, deleteRole, updateRole } from "../controllers/admin/role/index.js";
import checkPermission from "../middlewares/checkPermission.js";
import { PERMISSIONS } from "../constants/rbac.js";

const router = express.Router();

// Viewing roles needs the user-view permission; create/edit/delete need
// role-management (Owner only by default).
router.get("/", checkPermission(PERMISSIONS.USER_VIEW), getRoles);
router.post("/", checkPermission(PERMISSIONS.ROLE_MANAGE), createRole);
router.put("/", checkPermission(PERMISSIONS.ROLE_MANAGE), updateRole);
router.delete("/", checkPermission(PERMISSIONS.ROLE_MANAGE), deleteRole);

export default router;
