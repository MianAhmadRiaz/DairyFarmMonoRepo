import express from "express";
import { AddBull, GetAllBulls } from "../controllers/bull/index.js";

const router = express.Router();

router.get("/", GetAllBulls);
router.post("/", AddBull);


export default router;
