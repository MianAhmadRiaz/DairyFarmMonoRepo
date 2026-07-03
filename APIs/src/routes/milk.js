import express from "express";
import { addFinalMilk, AddMilkingSession, GetAllAnimalMilk, GetApprovedMilkingData, GetMilkAverageReport, GetMilkByDate, GetMilkDiffernceReport, GetMilkGraph, GetMilkingAnalytics, GetMilkingSessionsData, GetMilkOut, GetPendingMilkApprovalDates, Milkout, UpdateMilkingSession } from "../controllers/milk/index.js";
import requiredFieldsMiddleware from "../middlewares/requiredFieldsMiddleware.js";
import { milkingSessionSchema, milkOutSchema, UpdateMilkingSessionSchema } from "../constants/schemas.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Milk Management
 *   description: Milk recording, sessions, and analytics APIs
 */

/**
 * @swagger
 * /api/v1/milk:
 *   get:
 *     summary: Get all animal milk records
 *     tags: [Milk Management]
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
 *         name: animalId
 *         schema:
 *           type: string
 *         description: Filter by animal ID
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by date
 *     responses:
 *       200:
 *         description: Milk records fetched successfully
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
 *                         milkRecords:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Milk'
 *                         pagination:
 *                           $ref: '#/components/schemas/Pagination'
 *   post:
 *     summary: Add milk record for animal
 *     tags: [Milk Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - animal_id
 *               - quantity
 *               - session
 *             properties:
 *               animal_id:
 *                 type: string
 *                 example: "animal-uuid-123"
 *               quantity:
 *                 type: number
 *                 example: 25.5
 *               fat_content:
 *                 type: number
 *                 example: 3.5
 *               session:
 *                 type: string
 *                 enum: [morning, evening]
 *                 example: "morning"
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2025-10-07"
 *     responses:
 *       201:
 *         description: Milk record added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *
 * /api/v1/milk/graph:
 *   get:
 *     summary: Get milk production graph data
 *     tags: [Milk Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *           default: daily
 *     responses:
 *       200:
 *         description: Milk graph data fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *
 * /api/v1/milk/analytics:
 *   get:
 *     summary: Get milk production analytics
 *     tags: [Milk Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Milk analytics data fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *
 * /api/v1/milk/session:
 *   get:
 *     summary: Get milking sessions data
 *     tags: [Milk Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Milking sessions data fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *
 * /api/v1/milk/out:
 *   get:
 *     summary: Get milk out records
 *     tags: [Milk Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Milk out records fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *   post:
 *     summary: Record milk out transaction
 *     tags: [Milk Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *               - purpose
 *             properties:
 *               quantity:
 *                 type: number
 *                 example: 100
 *               purpose:
 *                 type: string
 *                 example: "Sale to market"
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2025-10-07"
 *     responses:
 *       201:
 *         description: Milk out recorded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */

router.get("/", GetAllAnimalMilk);
router.get("/graph", GetMilkGraph);
router.get("/session", GetMilkingSessionsData);
router.post("/out", requiredFieldsMiddleware(milkOutSchema), Milkout);
router.get("/out", GetMilkOut);
router.post("/approved", addFinalMilk);
router.get("/approved", GetApprovedMilkingData);
router.get("/pending-milk-approved/dates", GetPendingMilkApprovalDates);
router.get("/average-milk-report", GetMilkAverageReport);
router.get("/milk-difference-report", GetMilkDiffernceReport);
router.get("/by-date", GetMilkByDate);
router.get("/analytics", GetMilkingAnalytics);
router.post("/session", requiredFieldsMiddleware(milkingSessionSchema), AddMilkingSession);
router.put("/session", requiredFieldsMiddleware(UpdateMilkingSessionSchema), UpdateMilkingSession);

export default router;
