import express from "express";
import { reOrderReport, SummaryReportV1 } from "../controllers/stockReports/index.js";
import ExpiryReport from "../controllers/stockReports/expiryReport.js";

const router = express.Router();

router.get("/", SummaryReportV1);
router.get("/re-order", reOrderReport);
router.get("/expiry", ExpiryReport);

export default router;
