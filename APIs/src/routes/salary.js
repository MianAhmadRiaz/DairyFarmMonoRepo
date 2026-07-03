import express from "express";
import { AdvanceSalary, deleteInvoice, generateSalary, getSalaryAdvance, getSalaryInvoicesList, getEmployeeSalariesList, markInvoicePaid, updateAdvanceSalaryInvoice, updateInvoice, batchEditEmployeeSalaries, batchGenerateSalaries, giveAdvanceToEmployee, receiveAdvanceFromEmployee, getAdvanceTransactionHistory } from "../controllers/admin/salary/index.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Salary Management
 *   description: Employee salary and advance management APIs
 */

/**
 * @swagger
 * /api/v1/salaries/employees:
 *   get:
 *     summary: Get employee salaries list with calculations
 *     tags: [Salary Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of records per page
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: month
 *         schema:
 *           type: string
 *           pattern: '^[0-9]{2}$'
 *           example: '10'
 *         description: Month in MM format
 *       - in: query
 *         name: year
 *         schema:
 *           type: string
 *           pattern: '^[0-9]{4}$'
 *           example: '2025'
 *         description: Year in YYYY format
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filter by department name
 *       - in: query
 *         name: employeeId
 *         schema:
 *           type: string
 *         description: Get specific employee salary data
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [paid, unpaid, all]
 *           default: all
 *         description: Filter by payment status
 *     responses:
 *       200:
 *         description: Employee salaries list fetched successfully
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
 *                             $ref: '#/components/schemas/EmployeeSalary'
 *                         summary:
 *                           type: object
 *                           properties:
 *                             totalEmployees:
 *                               type: integer
 *                             totalBaseSalary:
 *                               type: number
 *                             totalGrossSalary:
 *                               type: number
 *                             totalDeductions:
 *                               type: number
 *                         pagination:
 *                           $ref: '#/components/schemas/Pagination'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   put:
 *     summary: Batch edit employee salaries
 *     tags: [Salary Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               employees:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     employeeId:
 *                       type: string
 *                     deduction:
 *                       type: number
 *                     bonus:
 *                       type: number
 *                     overtime:
 *                       type: number
 *                     grossSalary:
 *                       type: number
 *                     baseSalary:
 *                       type: number
 *                     presentDays:
 *                       type: integer
 *                     month:
 *                       type: string
 *     responses:
 *       200:
 *         description: Employee salaries edited successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */

/**
 * @swagger
 * /api/v1/salaries/employees/generate:
 *   post:
 *     summary: Batch generate salary invoices for all employees
 *     tags: [Salary Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               month:
 *                 type: string
 *                 example: '10'
 *               year:
 *                 type: string
 *                 example: '2025'
 *               skipAdvanceDeductionForEmployees:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of employee IDs to skip advance deduction for this month
 *               employees:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     employeeId:
 *                       type: string
 *                     deduction:
 *                       type: number
 *                     bonus:
 *                       type: number
 *                     overtime:
 *                       type: number
 *                     grossSalary:
 *                       type: number
 *                     baseSalary:
 *                       type: number
 *                     presentDays:
 *                       type: integer
 *     responses:
 *       201:
 *         description: Salary invoices generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */

/**
 * @swagger
 * /api/v1/salaries/advance/give:
 *   post:
 *     summary: Give advance salary to employee
 *     tags: [Salary Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdvanceTransaction'
 *     responses:
 *       201:
 *         description: Advance given to employee successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */

/**
 * @swagger
 * /api/v1/salaries/advance/receive:
 *   post:
 *     summary: Receive advance payment from employee
 *     tags: [Salary Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               employeeId:
 *                 type: string
 *               amount:
 *                 type: number
 *               transaction_date:
 *                 type: string
 *                 format: date
 *               payment_method:
 *                 type: string
 *                 enum: [cash, bank_transfer, cheque, mobile_payment, other]
 *               reference_number:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Advance payment received successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */

/**
 * @swagger
 * /api/v1/salaries/advance/history:
 *   get:
 *     summary: Get advance transaction history for admin portal
 *     tags: [Salary Management]
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
 *       - in: query
 *         name: transaction_type
 *         schema:
 *           type: string
 *           enum: [given, received, all]
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: payment_method
 *         schema:
 *           type: string
 *           enum: [cash, bank_transfer, cheque, mobile_payment, other]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, fully_recovered, written_off, all]
 *     responses:
 *       200:
 *         description: Advance transaction history fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */

router.put("/", updateInvoice);
router.post("/", generateSalary);
router.delete("/", deleteInvoice);
router.put("/paid", markInvoicePaid);
router.get("/", getSalaryInvoicesList);

// Employee salaries list with calculations
router.get("/employees", getEmployeeSalariesList);
// Batch edit employee salaries (edit deduction, bonus, overtime, gross salary)
router.put("/employees", batchEditEmployeeSalaries);
// Batch generate salary invoices for all employees
router.post("/employees/generate", batchGenerateSalaries);

// advance
router.post("/advance", AdvanceSalary);
router.get("/advance", getSalaryAdvance);
router.put("/advance", updateAdvanceSalaryInvoice);

// New advance transaction workflows
router.post("/advance/give", giveAdvanceToEmployee);
router.post("/advance/receive", receiveAdvanceFromEmployee);
router.get("/advance/history", getAdvanceTransactionHistory);

export default router;
