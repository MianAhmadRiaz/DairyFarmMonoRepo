import express from "express";
import { AddAnimal, DeleteAnimal, GetAllAnimals, GetAnimalPregnancyDetails, GetAnimalProfile, UpdateAnimal } from "../controllers/animal/index.js";
import requiredFielsMiddleware from "../middlewares/requiredFieldsMiddleware.js";
import { AddAnimalSchema, UpdateAnimalSchema } from "../constants/schemas.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Animals
 *   description: Animal management APIs
 */

/**
 * @swagger
 * /api/v1/animals:
 *   get:
 *     summary: Get all animals
 *     tags: [Animals]
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
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by tag ID or name
 *     responses:
 *       200:
 *         description: Animals fetched successfully
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
 *                         animals:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Animal'
 *                         pagination:
 *                           $ref: '#/components/schemas/Pagination'
 *   post:
 *     summary: Add new animal
 *     tags: [Animals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tag_id
 *               - name
 *               - breed
 *             properties:
 *               tag_id:
 *                 type: string
 *                 example: "TAG-001"
 *               name:
 *                 type: string
 *                 example: "Bessie"
 *               breed:
 *                 type: string
 *                 example: "Holstein"
 *               age:
 *                 type: integer
 *                 example: 3
 *               weight:
 *                 type: number
 *                 example: 550.5
 *               gender:
 *                 type: string
 *                 enum: [male, female]
 *                 example: "female"
 *     responses:
 *       201:
 *         description: Animal added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *   put:
 *     summary: Update animal
 *     tags: [Animals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - animalId
 *             properties:
 *               animalId:
 *                 type: string
 *               tag_id:
 *                 type: string
 *               name:
 *                 type: string
 *               breed:
 *                 type: string
 *               age:
 *                 type: integer
 *               weight:
 *                 type: number
 *               gender:
 *                 type: string
 *                 enum: [male, female]
 *     responses:
 *       200:
 *         description: Animal updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *   delete:
 *     summary: Delete animal
 *     tags: [Animals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: animalId
 *         required: true
 *         schema:
 *           type: string
 *         description: Animal UUID to delete
 *     responses:
 *       200:
 *         description: Animal deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *
 * /api/v1/animals/pregnency-details:
 *   get:
 *     summary: Get animal pregnancy details
 *     tags: [Animals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: animalId
 *         required: true
 *         schema:
 *           type: string
 *         description: Animal UUID
 *     responses:
 *       200:
 *         description: Pregnancy details fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */

router.get("/", GetAllAnimals);
router.get("/pregnency-details", GetAnimalPregnancyDetails);
router.get("/:animalId/profile", GetAnimalProfile);
router.delete("/", DeleteAnimal);
router.post("/", requiredFielsMiddleware(AddAnimalSchema), AddAnimal);
router.put("/", requiredFielsMiddleware(UpdateAnimalSchema), UpdateAnimal);


export default router;
