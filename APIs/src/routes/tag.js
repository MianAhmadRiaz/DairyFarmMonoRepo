import express from "express";
import requiredFieldsMiddleware from "../middlewares/requiredFieldsMiddleware.js";
import { AddTagSchema } from "../constants/schemas.js";
import { AddTag, DeleteTag, GetAllTags, UpdateTag } from "../controllers/tag/index.js";

const router = express.Router();

router.get("/", GetAllTags);
router.put("/", UpdateTag);
router.delete("/", DeleteTag);
router.post("/", requiredFieldsMiddleware(AddTagSchema), AddTag);

export default router;
