import express from "express";
import { CreateStockItem, DeleteStockItem, GetDayWiseConsumptionReport, GetStockItems, GetStockLevel, StockItemCostAnalysis, stockItemsAlerts } from "../controllers/stockItems/index.js";
import UpdateStockItem from "../controllers/stockItems/updateStockItem.js";
import requiredFieldsMiddleware from "../middlewares/requiredFieldsMiddleware.js";
import { addStockItemSchema, UpdateStockItemSchema } from "../constants/schemas.js";


const router = express.Router();

router.get("/", GetStockItems);
router.get("/day-wise-consumption-report", GetDayWiseConsumptionReport);
router.get("/cost", StockItemCostAnalysis);
router.post("/", requiredFieldsMiddleware(addStockItemSchema), CreateStockItem);
router.put("/", requiredFieldsMiddleware(UpdateStockItemSchema), UpdateStockItem);
router.delete("/", DeleteStockItem);
router.get("/level", GetStockLevel);
router.get("/alert", stockItemsAlerts);

export default router;
