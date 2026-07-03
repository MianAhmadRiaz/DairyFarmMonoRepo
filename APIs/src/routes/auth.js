import express from "express";
import { Current, ForgetPasswordEmail, ResetPassword, SetPassword, SignIn } from "../controllers/auth/index.js";
import { ForgetPasswordEmailSchema, ResetPasswordSchema, SetPasswordSchema, SignInSchema } from "../constants/schemas.js";
import requiredFieldsMiddleware from "../middlewares/requiredFieldsMiddleware.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import rateLimiter from "../middlewares/rateLimiter.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and authorization APIs
 */

/**
 * @swagger
 * /api/v1/auth/signin:
 *   post:
 *     summary: User sign in
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@cattlecare.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful
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
 *                         token:
 *                           type: string
 *                           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                         user:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                             email:
 *                               type: string
 *                             name:
 *                               type: string
 *                             role:
 *                               type: string
 *       400:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/v1/auth/current:
 *   get:
 *     summary: Get current user information
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/v1/auth/signup:
 *   post:
 *     summary: User registration
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@cattlecare.com"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: "password123"
 *               phone:
 *                 type: string
 *                 example: "+923001234567"
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: User already exists or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 * /api/v1/auth/forget-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "admin@cattlecare.com"
 *     responses:
 *       200:
 *         description: Password reset email sent
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *
 * /api/v1/auth/reset-password:
 *   post:
 *     summary: Reset password with token
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newPassword
 *             properties:
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *                 example: "newpassword123"
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */

// Public self-signup is removed. Farms are provisioned by the super admin; farm
// users are created by the farm Owner. Both receive a temporary password and
// set their own via /set-password on first login.
router.post("/signin", rateLimiter(20, 15 * 60 * 1000, "signin"), requiredFieldsMiddleware(SignInSchema), SignIn);
router.get("/current", authMiddleware, Current);
router.post("/set-password", rateLimiter(10, 15 * 60 * 1000, "setpw"), authMiddleware, requiredFieldsMiddleware(SetPasswordSchema), SetPassword);
router.post("/forget-password", rateLimiter(5, 15 * 60 * 1000, "forget"), requiredFieldsMiddleware(ForgetPasswordEmailSchema), ForgetPasswordEmail);
router.post("/reset-password", rateLimiter(10, 15 * 60 * 1000, "reset"), authMiddleware, requiredFieldsMiddleware(ResetPasswordSchema), ResetPassword);


export default router;
