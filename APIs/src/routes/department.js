import express from "express";
import { AddDepartment, DeleteDepartment, getDepartments, UpdateDepartment } from "../controllers/departments/index.js";

const router = express.Router();

router.get("/", getDepartments);
router.post("/", AddDepartment);
router.put("/", UpdateDepartment);
router.delete("/", DeleteDepartment);

export default router;
