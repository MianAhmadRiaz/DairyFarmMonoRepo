import express from "express";
import { CreateStockCategory, DeleteCategory, GetStockCategories } from "../controllers/stockCategories/index.js";


const router = express.Router();

router.get("/", GetStockCategories);
router.post("/", CreateStockCategory);
router.delete("/", DeleteCategory);

export default router;
