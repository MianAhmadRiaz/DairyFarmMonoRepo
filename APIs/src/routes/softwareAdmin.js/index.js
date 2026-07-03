import express from "express";

import AuthAPIs from "./auth.js";
import FarmsApis from "./farm.js";
import FarmConfigurationAPIs from "./farmConfiguration.js";
import UserAPIs from "./user.js";
import permissionAPIs from "./permissions.js";
import RolesAPIs from "./role.js";
import RequestsAPIs from "./requests.js";
import BillingAPIs from "./billing.js";

import authMiddleware from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.use("/auth", AuthAPIs);
router.use("/farms", authMiddleware, FarmsApis);
router.use("/user", authMiddleware, UserAPIs);
router.use("/farm-config", authMiddleware, FarmConfigurationAPIs);
router.use("/permissions", authMiddleware, permissionAPIs);
router.use("/roles", authMiddleware, RolesAPIs);
router.use("/requests", authMiddleware, RequestsAPIs);
router.use("/billing", authMiddleware, BillingAPIs);

export default router;
