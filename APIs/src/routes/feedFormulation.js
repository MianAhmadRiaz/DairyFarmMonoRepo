import express from "express";
import { CreateFeedFormulation, DeleteFormulation, FeedUsage, GetFeedFormulations, GetFeedUsage } from "../controllers/feedFormulations/index.js";

const router = express.Router();

router.get("/", GetFeedFormulations);
router.get("/usage", GetFeedUsage);
router.post("/usage", FeedUsage);
router.post("/", CreateFeedFormulation);
router.delete("/", DeleteFormulation);

export default router;
