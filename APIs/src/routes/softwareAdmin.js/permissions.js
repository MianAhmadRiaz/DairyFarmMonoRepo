import express from "express";
import { createPermession, getPermission } from "../../controllers/softwareAdmin/permissions/index.js";

const router = express.Router();

router.post("/", createPermession);
router.get("/", getPermission);

export default router;
