import express from "express";
import requiredFieldsMiddleware from "../middlewares/requiredFieldsMiddleware.js";
import { healthStatusSchema, penUpdateSchema, removalAnimalSchema, tagReplaceSchema, weightHistorySchema } from "../constants/schemas.js";
import { ChangePenId, GethealthStatusHistory, GetPenHistory, GetRemovalHistory, GetTagHistory, GetWeightHistory, RemoveAnimal, ReplaceTag, UpdateAnimalHealthStatus, UpdateAnimalWeight } from "../controllers/events/index.js";

const router = express.Router();

router.get("/tag-history", GetTagHistory)
router.get("/pen-history", GetPenHistory)
router.get("/weight-history", GetWeightHistory)
router.get("/animal-removal-history", GetRemovalHistory)
router.get("/health-status-history", GethealthStatusHistory);
router.post("/update-tag", requiredFieldsMiddleware(tagReplaceSchema), ReplaceTag);
router.post("/move-to-pen", requiredFieldsMiddleware(penUpdateSchema), ChangePenId);
router.post("/update-weight", requiredFieldsMiddleware(weightHistorySchema), UpdateAnimalWeight);
router.post("/remove-animal", requiredFieldsMiddleware(removalAnimalSchema), RemoveAnimal);
router.post("/update-health-status", requiredFieldsMiddleware(healthStatusSchema), UpdateAnimalHealthStatus);


export default router;
