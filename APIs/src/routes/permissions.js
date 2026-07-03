import express from "express";
import checkPermission from "../middlewares/checkPermission.js";
import { PERMISSIONS } from "../constants/rbac.js";
import { getPermission } from "../controllers/admin/permissions/index.js";

const router = express.Router();

// The permission catalog is seeded/system-managed, not farm-editable. Only the
// read endpoint is exposed, for the role-builder UI (needs role-management).
router.get("/", checkPermission(PERMISSIONS.ROLE_MANAGE), getPermission);

export default router;
