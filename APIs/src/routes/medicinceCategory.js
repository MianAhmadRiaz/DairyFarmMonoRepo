import express from "express";
import { CreateMedicineCategory, DeleteMedicineCategory, GetMedicineCategory } from "../controllers/medicineCategories/index.js";


const router = express.Router();

router.get("/", GetMedicineCategory);
router.post("/", CreateMedicineCategory);
router.delete("/", DeleteMedicineCategory);

export default router;
