import express from "express";
import { CreateRequest, DeleteRequest, getRequests } from "../controllers/requests/index.js";
import RespondRequest from "../controllers/requests/respondRequest.js";

const router = express.Router();

router.get("/", getRequests);
router.delete("/", DeleteRequest);
router.post("/", CreateRequest);
router.put("/respond", RespondRequest);

export default router;
