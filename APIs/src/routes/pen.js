import express from "express";
import requiredFieldsMiddleware from "../middlewares/requiredFieldsMiddleware.js";
import { NameOnlySchema } from "../constants/schemas.js";
import { GetAllPens, AddPen, UpdatePen, DeletePen } from "../controllers/pen/index.js";

const router = express.Router();

router.get("/", GetAllPens);
router.put("/", UpdatePen);
router.delete("/", DeletePen);
router.post("/", requiredFieldsMiddleware(NameOnlySchema), AddPen);

export default router;
