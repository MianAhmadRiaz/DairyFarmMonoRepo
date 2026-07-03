import express from "express";
import requiredFieldsMiddleware from "../middlewares/requiredFieldsMiddleware.js";
import { NameOnlySchema } from "../constants/schemas.js";
import { AddAnimalSubCategory, GetAllAnimalSubCategories } from "../controllers/animalSubCategories/index.js";

const router = express.Router();

router.get("/", GetAllAnimalSubCategories);
router.post("/", requiredFieldsMiddleware(NameOnlySchema), AddAnimalSubCategory);

export default router;
