import express from "express";
import { createRole, getRoles, deleteRole, updateRole } from "../../controllers/softwareAdmin/role/index.js";
import systemAdminCheckPermission from "../../middlewares/systemAdminCheckPermission.js";
import { SystemAdminPermissions } from "../../constants/index.js";

const router = express.Router();

router.post("/", systemAdminCheckPermission(SystemAdminPermissions.createRoles), createRole);
router.get("/", systemAdminCheckPermission(SystemAdminPermissions.viewRoles), getRoles);
router.delete("/", systemAdminCheckPermission(SystemAdminPermissions.deleteRoles), deleteRole);
router.put("/", systemAdminCheckPermission(SystemAdminPermissions.editRoles), updateRole);

export default router;
