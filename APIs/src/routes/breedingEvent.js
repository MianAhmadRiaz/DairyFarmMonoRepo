import express from "express";
import requiredFieldsMiddleware from "../middlewares/requiredFieldsMiddleware.js";
import { abortionEventSchema, aiBreedingSchema, bullBreedingSchema, calvingEventSchema, dryOffEventSchema, heatEventSchema, pregnancyTestSchema, protocolEventSchema, protocolStepSchema } from "../constants/schemas.js";
import { AbortionsEvent, AiBreedingEvent, BullBreedingEvent, CalvingEvents, CalvingSprints, DryoffEvents, GetAbortionEvents, GetAiBreedingEvents, GetBullBreedingEvents, GetCalvingsEvents, GetCalvingSprints, GetDryOffEvents, GetheatDetectionReasons, GetHeatEvents, GetHerdAlerts, GetPregnancyTestEvent, GetProtocolEvents, GetProtocolSteps, GetReproductionSummary, HeatDetectionReason, HeatEvent, PregnancyTestEvent, ProtocolEvent, ProtocolStep } from "../controllers/breedingEvent/index.js";


const router = express.Router();

// get events apis

router.get("/protocol", GetProtocolEvents);
router.get("/protocol/steps", GetProtocolSteps);
router.get("/heat", GetHeatEvents);
router.get("/ai", GetAiBreedingEvents);
router.get("/bull", GetBullBreedingEvents);
router.get("/pregnancy", GetPregnancyTestEvent);
router.get("/abortion", GetAbortionEvents);
router.get("/calving", GetCalvingsEvents);
router.get("/dryoff", GetDryOffEvents);
router.get("/calving/offsprint", GetCalvingSprints);
router.get("/heat/reason", GetheatDetectionReasons);
router.get("/alerts", GetHerdAlerts);
router.get("/reproduction-summary", GetReproductionSummary);

// add events apis

router.post("/protocol", requiredFieldsMiddleware(protocolEventSchema), ProtocolEvent);
router.post("/protocol/steps", requiredFieldsMiddleware(protocolStepSchema), ProtocolStep);
router.post("/heat", requiredFieldsMiddleware(heatEventSchema), HeatEvent);
router.post("/ai", requiredFieldsMiddleware(aiBreedingSchema), AiBreedingEvent);
router.post("/bull", requiredFieldsMiddleware(bullBreedingSchema), BullBreedingEvent);
router.post("/pregnancy", requiredFieldsMiddleware(pregnancyTestSchema), PregnancyTestEvent);
router.post("/abortion", requiredFieldsMiddleware(abortionEventSchema), AbortionsEvent);
router.post("/calving", requiredFieldsMiddleware(calvingEventSchema), CalvingEvents);
router.post("/dryoff", requiredFieldsMiddleware(dryOffEventSchema), DryoffEvents);
router.post("/calving/offsprint", CalvingSprints);
router.post("/heat/reason", HeatDetectionReason);


export default router;
