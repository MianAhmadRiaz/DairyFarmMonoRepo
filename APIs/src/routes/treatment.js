import express from "express";
import requiredFieldsMiddleware from "../middlewares/requiredFieldsMiddleware.js";
import { addTreatmentSchema } from "../constants/schemas.js";
import { AddTreatment, DeleteTreatment, GetActiveWithdrawals, GetTreatments, GetTreatmentSummary } from "../controllers/treatment/index.js";

const router = express.Router();

router.get("/", GetTreatments);
router.get("/withdrawals", GetActiveWithdrawals);
router.get("/summary", GetTreatmentSummary);
router.post("/", requiredFieldsMiddleware(addTreatmentSchema), AddTreatment);
router.delete("/", DeleteTreatment);

export default router;
