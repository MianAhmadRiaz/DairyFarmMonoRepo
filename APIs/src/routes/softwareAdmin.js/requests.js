import express from "express";
import { actionOnRequest, DeleteRequest, getRequests } from "../../controllers/softwareAdmin/requests/index.js";

const router = express.Router();

router.get("/", getRequests);
router.put("/", actionOnRequest);
router.delete("/", DeleteRequest);

export default router;
