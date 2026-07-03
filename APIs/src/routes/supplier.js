import express from "express";
import { AddSupplier, DeleteSupplier, GetSuppliers } from "../controllers/suppliers/index.js";
import requiredFieldsMiddleware from "../middlewares/requiredFieldsMiddleware.js";
import { addSupplierSchema } from "../constants/schemas.js";


const router = express.Router();

router.get("/", GetSuppliers);
router.post("/", requiredFieldsMiddleware(addSupplierSchema), AddSupplier);
router.delete("/", DeleteSupplier);

export default router;
