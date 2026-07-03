import express from "express";
import { CreateTask, DeleteTask, GetTasks } from "../controllers/task/index.js";

const router = express.Router();

router.get("/", GetTasks);
router.delete("/", DeleteTask);
router.post("/", CreateTask);

export default router;
