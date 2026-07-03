import express from "express";
import { AddPurchaseItem, DeletePurchaseItem, GetPurchaseItems } from "../controllers/purchaseItems/index.js";
import requiredFieldsMiddleware from "../middlewares/requiredFieldsMiddleware.js";
import { addPurchaseItemSchema } from "../constants/schemas.js";


const router = express.Router();

router.get("/", GetPurchaseItems);
router.post("/", requiredFieldsMiddleware(addPurchaseItemSchema), AddPurchaseItem);
router.delete("/", DeletePurchaseItem);

export default router;
