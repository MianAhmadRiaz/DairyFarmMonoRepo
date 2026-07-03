import express from "express";
import { getFarmConfiguration, UpdateFarmConfiguration } from "../../controllers/softwareAdmin/farmConfiguration/index.js";

const router = express.Router();

router.get("/", getFarmConfiguration);
router.put("/", UpdateFarmConfiguration);

export default router;
