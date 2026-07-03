import express from "express";
import { AddEmployee, deleteEmployee, getEmployeesList, getEmployeeById, updateEmployee, getEmployeeDashboard } from "../controllers/admin/employee/index.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Employees
 *   description: Employee management APIs
 */

/**
 * @swagger
 * /api/v1/employees:
 *   get:
 *     summary: Get employees list
 *     tags: [Employees]
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
 *         description: Search by name or designation
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filter by department
 *     responses:
 *       200:
 *         description: Employees list fetched successfully
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
 *                         employees:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Employee'
 *                         pagination:
 *                           $ref: '#/components/schemas/Pagination'
 *   post:
 *     summary: Add new employee
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - designation
 *               - salary
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               designation:
 *                 type: string
 *                 example: "Farm Manager"
 *               department:
 *                 type: string
 *                 example: "Operations"
 *               salary:
 *                 type: number
 *                 example: 50000
 *               phone:
 *                 type: string
 *                 example: "+923001234567"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@farm.com"
 *               leave_allow:
 *                 type: number
 *                 example: 2
 *     responses:
 *       201:
 *         description: Employee added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *   put:
 *     summary: Update employee
 *     tags: [Employees]
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
 *             properties:
 *               employeeId:
 *                 type: string
 *               name:
 *                 type: string
 *               designation:
 *                 type: string
 *               department:
 *                 type: string
 *               salary:
 *                 type: number
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               leave_allow:
 *                 type: number
 *     responses:
 *       200:
 *         description: Employee updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *   delete:
 *     summary: Delete employee
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee UUID to delete
 *     responses:
 *       200:
 *         description: Employee deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *
 * /api/v1/employees/dashboard:
 *   get:
 *     summary: Get employee dashboard metrics
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Employee dashboard data fetched successfully
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
 *                         summary:
 *                           type: object
 *                           properties:
 *                             totalEmployees:
 *                               type: integer
 *                             totalSalaryPaidPKR:
 *                               type: number
 *                             currentYearSalaryPaidPKR:
 *                               type: number
 *                             pendingSalariesAmountPKR:
 *                               type: number
 *                             totalAdvanceAmountPKR:
 *                               type: number
 *                         todayAttendance:
 *                           type: object
 *                           properties:
 *                             present:
 *                               type: integer
 *                             absent:
 *                               type: integer
 *                             onLeave:
 *                               type: integer
 *                             notMarked:
 *                               type: integer
 *                             attendancePercentage:
 *                               type: number
 */

router.post("/", AddEmployee);
router.put("/", updateEmployee);
router.get("/", getEmployeesList);
router.get("/dashboard", getEmployeeDashboard);
router.get("/:id", getEmployeeById);
router.delete("/", deleteEmployee);
router.delete("/:id", deleteEmployee);

export default router;
