import express from "express";
import { AddCompany, DeleteCompany, GetCompanies } from "../controllers/companies/index.js";

const router = express.Router();

router.get("/", GetCompanies);
router.post("/", AddCompany);
router.delete("/", DeleteCompany);

export default router;
