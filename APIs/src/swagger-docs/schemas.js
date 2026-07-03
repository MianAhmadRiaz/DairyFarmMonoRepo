/**
 * @swagger
 * components:
 *   schemas:
 *     ApiResponse:
 *       type: object
 *       properties:
 *         statusCode:
 *           type: integer
 *           example: 200
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Operation completed successfully"
 *         type:
 *           type: string
 *           example: "employeeSalaries"
 *         data:
 *           type: object
 *           description: "Response data varies by endpoint"
 *     
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         statusCode:
 *           type: integer
 *           example: 400
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Error message"
 *         error:
 *           type: string
 *           example: "Detailed error description"
 *     
 *     Employee:
 *       type: object
 *       properties:
 *         uuid:
 *           type: string
 *           example: "employee-uuid-123"
 *         name:
 *           type: string
 *           example: "John Doe"
 *         designation:
 *           type: string
 *           example: "Farm Manager"
 *         department:
 *           type: string
 *           example: "Operations"
 *         salary:
 *           type: number
 *           example: 50000
 *         leave_allow:
 *           type: number
 *           example: 2
 *         isDeleted:
 *           type: boolean
 *           example: false
 *         farmId:
 *           type: string
 *           example: "farm-uuid-123"
 *     
 *     EmployeeSalary:
 *       type: object
 *       properties:
 *         employeeId:
 *           type: string
 *           example: "employee-uuid-123"
 *         name:
 *           type: string
 *           example: "John Doe"
 *         designation:
 *           type: string
 *           example: "Farm Manager"
 *         department:
 *           type: string
 *           example: "Operations"
 *         totalDaysInMonth:
 *           type: integer
 *           example: 31
 *         allowedLeaves:
 *           type: integer
 *           example: 2
 *         workingDays:
 *           type: integer
 *           example: 29
 *         presentDays:
 *           type: integer
 *           example: 26
 *         absentDays:
 *           type: integer
 *           example: 3
 *         leaveDays:
 *           type: integer
 *           example: 2
 *         baseSalary:
 *           type: number
 *           example: 50000
 *         salaryPerDay:
 *           type: number
 *           example: 1724.14
 *         deduction:
 *           type: number
 *           example: 5000
 *         bonus:
 *           type: number
 *           example: 2000
 *         overtime:
 *           type: number
 *           example: 1500
 *         grossSalary:
 *           type: number
 *           example: 46327.64
 *         status:
 *           type: string
 *           enum: [paid, unpaid, calculated]
 *           example: "calculated"
 *         month:
 *           type: string
 *           example: "2025-10"
 *     
 *     AdvanceTransaction:
 *       type: object
 *       properties:
 *         employeeId:
 *           type: string
 *           example: "employee-uuid-123"
 *         amount:
 *           type: number
 *           example: 25000
 *         transaction_date:
 *           type: string
 *           format: date
 *           example: "2025-10-07"
 *         payment_method:
 *           type: string
 *           enum: [cash, bank_transfer, cheque, mobile_payment, other]
 *           example: "cash"
 *         reference_number:
 *           type: string
 *           example: "ADV-001"
 *         description:
 *           type: string
 *           example: "Emergency advance for medical expenses"
 *         deduct_from_salary:
 *           type: boolean
 *           example: true
 *         deduction_start_month:
 *           type: string
 *           example: "2025-11"
 *         monthly_deduction_amount:
 *           type: number
 *           example: 5000
 *     
 *     SalaryInvoice:
 *       type: object
 *       properties:
 *         uuid:
 *           type: string
 *           example: "invoice-uuid-123"
 *         employee_id:
 *           type: string
 *           example: "employee-uuid-123"
 *         name:
 *           type: string
 *           example: "John Doe"
 *         month:
 *           type: string
 *           example: "2025-10"
 *         base_salary:
 *           type: number
 *           example: 50000
 *         total_days:
 *           type: integer
 *           example: 31
 *         present_days:
 *           type: integer
 *           example: 26
 *         absence_days:
 *           type: integer
 *           example: 5
 *         deduction:
 *           type: number
 *           example: 5000
 *         bonus:
 *           type: number
 *           example: 2000
 *         overtime:
 *           type: number
 *           example: 1500
 *         gross_salary:
 *           type: number
 *           example: 48500
 *         status:
 *           type: string
 *           enum: [paid, unpaid]
 *           example: "unpaid"
 *         advance_deduction_skipped:
 *           type: boolean
 *           example: false
 *     
 *     Pagination:
 *       type: object
 *       properties:
 *         page:
 *           type: integer
 *           example: 1
 *         totalPages:
 *           type: integer
 *           example: 5
 *         limit:
 *           type: integer
 *           example: 10
 *         skip:
 *           type: integer
 *           example: 0
 *         totalCount:
 *           type: integer
 *           example: 45
 *     
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "admin@cattlecare.com"
 *         password:
 *           type: string
 *           example: "password123"
 *     
 *     LoginResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ApiResponse'
 *         - type: object
 *           properties:
 *             data:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   type: object
 *                   properties:
 *                     uuid:
 *                       type: string
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *                     role:
 *                       type: string
 *                     farmId:
 *                       type: string
 *     
 *     Animal:
 *       type: object
 *       properties:
 *         uuid:
 *           type: string
 *           example: "animal-uuid-123"
 *         tag_id:
 *           type: string
 *           example: "TAG-001"
 *         name:
 *           type: string
 *           example: "Bessie"
 *         breed:
 *           type: string
 *           example: "Holstein"
 *         age:
 *           type: integer
 *           example: 3
 *         weight:
 *           type: number
 *           example: 550.5
 *         gender:
 *           type: string
 *           enum: [male, female]
 *           example: "female"
 *         status:
 *           type: string
 *           example: "active"
 *         farmId:
 *           type: string
 *           example: "farm-uuid-123"
 *     
 *     Milk:
 *       type: object
 *       properties:
 *         uuid:
 *           type: string
 *           example: "milk-uuid-123"
 *         animal_id:
 *           type: string
 *           example: "animal-uuid-123"
 *         quantity:
 *           type: number
 *           example: 25.5
 *         fat_content:
 *           type: number
 *           example: 3.5
 *         date:
 *           type: string
 *           format: date
 *           example: "2025-10-07"
 *         session:
 *           type: string
 *           enum: [morning, evening]
 *           example: "morning"
 *         farmId:
 *           type: string
 *           example: "farm-uuid-123"
 */