import express from "express";
import requiredFieldsMiddleware from "../middlewares/requiredFieldsMiddleware.js";
import { NameOnlySchema } from "../constants/schemas.js";
import { AddBreedType, GetAllBreedTypes } from "../controllers/breedType/index.js";

const router = express.Router();

router.get("/", GetAllBreedTypes);
router.post("/", requiredFieldsMiddleware(NameOnlySchema), AddBreedType);

export default router;
