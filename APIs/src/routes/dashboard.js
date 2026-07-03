import express from "express";
import { GetHerdInformation, GetMilkInformation, GetMilkPerLactation, GetHerdComparison, GetFinancialsEstimate } from "../controllers/dashboard/index.js";
import requiredFieldsMiddleware from "../middlewares/requiredFieldsMiddleware.js";
import { getMilkInfoSchema, milkPerLactationSchema } from "../constants/schemas.js";
import farmAccessGuard from "../middlewares/farmAccessGuard.js";
import modulePermission from "../middlewares/modulePermission.js";
import { PERMISSIONS as P } from "../constants/rbac.js";

const router = express.Router();

router.get("/", GetHerdInformation);
router.get("/milk", requiredFieldsMiddleware(getMilkInfoSchema, true), GetMilkInformation);
router.get("/milk/lactation", requiredFieldsMiddleware(milkPerLactationSchema, true), GetMilkPerLactation);

// Unlike the endpoints above, these two surface health/breeding/cost-derived
// data (treatment counts, mortality, per-cow profitability) — the same kind of
// data HEALTH_VIEW/HERD_VIEW already gate elsewhere. They deliberately opt back
// into the standard farmAccessGuard + modulePermission gate rather than
// inheriting this router's guard-free mount.
router.get("/comparison", farmAccessGuard, modulePermission(P.HERD_VIEW, P.HERD_VIEW), GetHerdComparison);
router.get("/financials-estimate", farmAccessGuard, modulePermission(P.HERD_VIEW, P.HERD_VIEW), GetFinancialsEstimate);

export default router;
