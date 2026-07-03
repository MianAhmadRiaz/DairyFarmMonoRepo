import express from "express";
import { ChangeUserPassword, createUser, deleteUser, getUserList, updateUser, updateUserRole } from "../../controllers/softwareAdmin/user/index.js";

const router = express.Router();

router.post("/", createUser);
router.delete("/", deleteUser);
router.get("/", getUserList);
router.put("/", updateUser);
router.put("/password", ChangeUserPassword);
router.put("/role", updateUserRole);

export default router;
