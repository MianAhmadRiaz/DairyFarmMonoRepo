import express from "express";
import { CreateMilkCategory, DeleteMilkCategory, GetMilkCategory } from "../controllers/milkCategories/index.js";


const router = express.Router();

router.get("/", GetMilkCategory);
router.post("/", CreateMilkCategory);
router.delete("/", DeleteMilkCategory);

export default router;
