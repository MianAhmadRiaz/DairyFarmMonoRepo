import express from "express";
import { AddUnitOfMeasure, DeleteUnit, GetUnits } from "../controllers/unitOfMeasures/index.js";
import requiredFieldsMiddleware from "../middlewares/requiredFieldsMiddleware.js";
import { NameOnlySchema } from "../constants/schemas.js";

const router = express.Router();

router.get("/", GetUnits);
router.post("/", requiredFieldsMiddleware(NameOnlySchema), AddUnitOfMeasure);
router.delete("/", DeleteUnit);

export default router;
