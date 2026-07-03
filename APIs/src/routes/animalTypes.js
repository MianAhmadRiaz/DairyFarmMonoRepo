import express from "express";
import requiredFieldsMiddleware from "../middlewares/requiredFieldsMiddleware.js";
import { NameOnlySchema } from "../constants/schemas.js";
import { AddAnimalType, GetAllAnimalTypes } from "../controllers/animalTypes/index.js";

const router = express.Router();

router.get("/", GetAllAnimalTypes);
router.post("/", requiredFieldsMiddleware(NameOnlySchema), AddAnimalType);

export default router;
