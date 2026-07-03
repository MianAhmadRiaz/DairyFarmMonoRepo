import express from "express";
import { getAttendance, markAttendance, updateAttendance, deleteAttendance } from "../controllers/admin/attendance/index.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Attendance
 *   description: Employee attendance management APIs
 */

/**
 * @swagger
 * /api/v1/attendance:
 *   get:
 *     summary: Get attendance records
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: employeeId
 *         schema:
 *           type: string
 *         description: Filter by employee ID
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by date
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [present, absent, leave]
 *         description: Filter by attendance status
 *     responses:
 *       200:
 *         description: Attendance records fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         attendance:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               uuid:
 *                                 type: string
 *                               employee_id:
 *                                 type: string
 *                               date:
 *                                 type: string
 *                                 format: date
 *                               status:
 *                                 type: string
 *                                 enum: [present, absent, leave]
 *                               remarks:
 *                                 type: string
 *                         pagination:
 *                           $ref: '#/components/schemas/Pagination'
 *   post:
 *     summary: Mark employee attendance
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employeeId
 *               - status
 *               - date
 *             properties:
 *               employeeId:
 *                 type: string
 *                 example: "employee-uuid-123"
 *               status:
 *                 type: string
 *                 enum: [present, absent, leave]
 *                 example: "present"
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2025-10-07"
 *               remarks:
 *                 type: string
 *                 example: "Late arrival due to transport issue"
 *     responses:
 *       201:
 *         description: Attendance marked successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */

router.get("/", getAttendance);
router.post("/", markAttendance);
router.put("/", updateAttendance);
router.delete("/", deleteAttendance);

export default router;
