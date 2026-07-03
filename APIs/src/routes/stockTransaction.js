import express from "express";
import { AddMultipleStockTransactions, AddStockTransaction, GetStockTransactions } from "../controllers/stockTransactions/index.js";
import requiredFieldsMiddleware from "../middlewares/requiredFieldsMiddleware.js";
import { addStockTransactionSchema } from "../constants/schemas.js";


const router = express.Router();

router.get("/", GetStockTransactions);
router.post("/", requiredFieldsMiddleware(addStockTransactionSchema), AddStockTransaction);
router.post("/multiple", AddMultipleStockTransactions);

export default router;
