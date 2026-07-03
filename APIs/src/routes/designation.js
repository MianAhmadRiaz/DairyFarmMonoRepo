import express from "express";
import { addDesignation, getDesignations, updateDesignation, deleteDesignation } from "../controllers/designations/index.js";

const router = express.Router();

router.get("/", getDesignations);
router.post("/", addDesignation);
router.put("/", updateDesignation);
router.delete("/", deleteDesignation);

export default router;
