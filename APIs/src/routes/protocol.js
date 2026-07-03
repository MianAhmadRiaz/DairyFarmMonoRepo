import express from "express";
import requiredFieldsMiddleware from "../middlewares/requiredFieldsMiddleware.js";
import { NameOnlySchema, AddProtocolSchema } from "../constants/schemas.js";
import { GetProtocols, AddNewProtocol, GetInjections, AddInjection } from "../controllers/protocol/index.js";

const router = express.Router();

router.get("/", GetProtocols);
router.post("/", requiredFieldsMiddleware(AddProtocolSchema), AddNewProtocol);
router.get("/injections", GetInjections);
router.post("/injections/", requiredFieldsMiddleware(NameOnlySchema), AddInjection);

export default router;
