/**
 * Advanced Salary Management API Documentation
 * 
 * This document covers the complete advance salary workflow including:
 * 1. Give Advance to Employee
 * 2. Receive Advance from Employee  
 * 3. Admin Portal - Transaction History
 * 4. Integration with Salary Generation
 * 5. Finance Module Preparation
 */

/**
 * ===== GIVE ADVANCE TO EMPLOYEE =====
 * 
 * Endpoint: POST /api/v1/salaries/advance/give
 * Authentication: Required (Bearer Token)
 * 
 * Description: Give advance salary to an employee (full or partial amount)
 * 
 * Request Body:
 * {
 *   "employeeId": "employee-uuid-here",
 *   "amount": 25000,
 *   "transaction_date": "2025-10-05",
 *   "payment_method": "cash",
 *   "reference_number": "ADV-001",
 *   "description": "Emergency advance for medical expenses",
 *   "deduct_from_salary": true,
 *   "deduction_start_month": "2025-11",
 *   "monthly_deduction_amount": 5000
 * }
 * 
 * Field Details:
 * - employeeId: Required - UUID of employee
 * - amount: Required - Amount of advance (no validation limit)
 * - transaction_date: Optional - Defaults to current date
 * - payment_method: Optional - 'cash', 'bank_transfer', 'cheque', 'mobile_payment', 'other'
 * - reference_number: Optional - Bank ref, receipt number, etc.
 * - description: Optional - Reason for advance
 * - deduct_from_salary: Optional - Default true, whether to deduct from salary
 * - deduction_start_month: Optional - Which month to start deduction (YYYY-MM)
 * - monthly_deduction_amount: Optional - Fixed amount per month, if null deducts full balance
 * 
 * Response:
 * {
 *   "success": true,
 *   "statusCode": 201,
 *   "message": "Advance given to employee successfully.",
 *   "type": "advanceGiven",
 *   "data": {
 *     "transaction": {
 *       "transactionId": "transaction-uuid",
 *       "employeeId": "employee-uuid",
 *       "employeeName": "John Doe",
 *       "amount": 25000,
 *       "transactionDate": "2025-10-05T00:00:00.000Z",
 *       "paymentMethod": "cash",
 *       "referenceNumber": "ADV-001",
 *       "deductFromSalary": true,
 *       "deductionStartMonth": "2025-11",
 *       "monthlyDeductionAmount": 5000
 *     },
 *     "employeeAdvanceBalance": {
 *       "totalAdvancesGiven": 25000,
 *       "totalAdvancesReceived": 0,
 *       "outstandingBalance": 25000
 *     }
 *   }
 * }
 */

/**
 * ===== RECEIVE ADVANCE FROM EMPLOYEE =====
 * 
 * Endpoint: POST /api/v1/salaries/advance/receive
 * Authentication: Required (Bearer Token)
 * 
 * Description: Record advance payment received from employee (full or installment)
 * 
 * Request Body:
 * {
 *   "employeeId": "employee-uuid-here",
 *   "amount": 5000,
 *   "transaction_date": "2025-10-05",
 *   "payment_method": "bank_transfer",
 *   "reference_number": "TXN-12345",
 *   "description": "First installment of advance repayment"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "statusCode": 201,
 *   "message": "Advance payment received from employee successfully.",
 *   "type": "advanceReceived",
 *   "data": {
 *     "transaction": {
 *       "transactionId": "transaction-uuid",
 *       "employeeId": "employee-uuid",
 *       "employeeName": "John Doe",
 *       "amount": 5000,
 *       "transactionDate": "2025-10-05T00:00:00.000Z",
 *       "paymentMethod": "bank_transfer",
 *       "referenceNumber": "TXN-12345"
 *     },
 *     "employeeAdvanceBalance": {
 *       "totalAdvancesGiven": 25000,
 *       "totalAdvancesReceived": 5000,
 *       "outstandingBalance": 20000,
 *       "isFullyRecovered": false
 *     },
 *     "previousBalance": 25000,
 *     "amountReceived": 5000,
 *     "newBalance": 20000
 *   }
 * }
 */

/**
 * ===== ADMIN PORTAL - ADVANCE TRANSACTION HISTORY =====
 * 
 * Endpoint: GET /api/v1/salaries/advance/history
 * Authentication: Required (Bearer Token)
 * 
 * Description: Get comprehensive advance transaction history for admin portal
 * 
 * Query Parameters:
 * - limit: Number of records per page (default: 10)
 * - page: Page number (default: 1)
 * - employeeId: Filter by specific employee
 * - transaction_type: 'given', 'received', or 'all' (default: 'all')
 * - start_date: Start date filter (YYYY-MM-DD)
 * - end_date: End date filter (YYYY-MM-DD)
 * - payment_method: Filter by payment method
 * - status: 'active', 'fully_recovered', 'written_off', or 'all' (default: 'all')
 * 
 * Sample Request:
 * GET /api/v1/salaries/advance/history?transaction_type=given&start_date=2025-10-01&limit=20
 * 
 * Response:
 * {
 *   "success": true,
 *   "statusCode": 200,
 *   "message": "Advance transaction history fetched successfully.",
 *   "type": "advanceHistory",
 *   "data": {
 *     "transactions": [
 *       {
 *         "transactionId": "uuid-1",
 *         "employeeId": "emp-uuid-1",
 *         "employeeName": "John Doe",
 *         "employeeDesignation": "Farm Manager",
 *         "employeeDepartment": "Operations",
 *         "transactionType": "given",
 *         "amount": 25000,
 *         "transactionDate": "2025-10-05T00:00:00.000Z",
 *         "paymentMethod": "cash",
 *         "referenceNumber": "ADV-001",
 *         "description": "Emergency advance",
 *         "deductFromSalary": true,
 *         "deductionStartMonth": "2025-11",
 *         "monthlyDeductionAmount": 5000,
 *         "status": "active",
 *         "financialYear": "2025-2026",
 *         "createdAt": "2025-10-05T10:30:00.000Z"
 *       }
 *     ],
 *     "summary": {
 *       "totalAdvancesGiven": {
 *         "count": 15,
 *         "amount": 375000
 *       },
 *       "totalAdvancesReceived": {
 *         "count": 8,
 *         "amount": 125000
 *       },
 *       "netOutstanding": 250000
 *     },
 *     "pagination": {
 *       "page": 1,
 *       "totalPages": 3,
 *       "limit": 20,
 *       "skip": 0,
 *       "totalCount": 23
 *     },
 *     "filters": {
 *       "employeeId": null,
 *       "transactionType": "given",
 *       "startDate": "2025-10-01",
 *       "endDate": null,
 *       "paymentMethod": null,
 *       "status": "all"
 *     }
 *   }
 * }
 */

/**
 * ===== SALARY GENERATION WITH ADVANCE HANDLING =====
 * 
 * Endpoint: POST /api/v1/salaries/employees/generate
 * Authentication: Required (Bearer Token)
 * 
 * Description: Generate salaries with automatic advance deduction and skip options
 * 
 * Request Body:
 * {
 *   "month": "10",
 *   "year": "2025",
 *   "skipAdvanceDeductionForEmployees": ["employee-uuid-1", "employee-uuid-2"],
 *   "employees": [
 *     {
 *       "employeeId": "employee-uuid-1",
 *       "deduction": 2000,
 *       "bonus": 5000,
 *       "overtime": 3000,
 *       "grossSalary": 53000,
 *       "baseSalary": 50000,
 *       "presentDays": 28
 *     }
 *   ]
 * }
 * 
 * Key Features:
 * - Automatically calculates advance deductions from AdvanceTransaction table
 * - Respects "deduct_from_salary" flag per transaction
 * - Honors "deduction_start_month" and "monthly_deduction_amount" settings
 * - Allows skipping advance deduction for specific employees this month
 * - Combines advance deductions with other manual deductions
 * - Records whether advance deduction was skipped in salary invoice
 */

/**
 * ===== FINANCE MODULE INTEGRATION =====
 * 
 * All advance transactions are designed for seamless finance module integration:
 * 
 * 1. Transaction Categorization:
 *    - Given advances: Classified as "Employee Advance" expense
 *    - Received payments: Classified as "Advance Recovery" income
 * 
 * 2. Financial Year Tracking:
 *    - Automatic financial year calculation (April to March cycle)
 *    - All transactions tagged with financial year for reporting
 * 
 * 3. Cash Flow Tracking:
 *    - Money out: Advances given to employees
 *    - Money in: Advance payments received from employees
 *    - Net position: Outstanding advance balances
 * 
 * 4. Reporting Ready:
 *    - Employee-wise advance statements
 *    - Monthly/yearly advance summaries
 *    - Department-wise advance analysis
 *    - Payment method breakdowns
 * 
 * 5. Audit Trail:
 *    - Complete transaction history with timestamps
 *    - Created/updated by user tracking
 *    - Reference numbers for bank reconciliation
 *    - Status tracking for advance lifecycle
 */

/**
 * ===== COMPLETE WORKFLOW EXAMPLES =====
 * 
 * Example 1: Give Advance and Auto-Deduct from Salary
 * 1. POST /advance/give → Give 20,000 advance, set monthly deduction 5,000
 * 2. POST /employees/generate → Salary generation auto-deducts 5,000
 * 3. Repeat step 2 for 4 months → Advance fully recovered
 * 
 * Example 2: Give Advance with Manual Payment
 * 1. POST /advance/give → Give 15,000 advance, deduct_from_salary: false
 * 2. POST /advance/receive → Employee pays 7,500 manually
 * 3. POST /advance/receive → Employee pays remaining 7,500
 * 4. System auto-marks advance as "fully_recovered"
 * 
 * Example 3: Skip Deduction for One Month
 * 1. Employee has outstanding advance with auto-deduction enabled
 * 2. POST /employees/generate → Include employee in skipAdvanceDeductionForEmployees
 * 3. Salary generated without advance deduction for this month
 * 4. Next month generation will resume normal deduction
 * 
 * Example 4: Admin Portal Monitoring
 * 1. GET /advance/history → View all advance transactions
 * 2. GET /advance/history?employeeId=uuid → Employee-specific history
 * 3. GET /advance/history?transaction_type=given&status=active → Outstanding advances
 * 4. Use summary data for financial planning and cash flow analysis
 */