/**
 * Employee Salaries List API Documentation
 * 
 * Endpoint: GET /api/v1/salaries/employees
 * Authentication: Required (Bearer Token)
 * 
 * Description: Get comprehensive list of employee salaries with detailed calculations
 * 
 * Query Parameters:
 * - limit (optional): Number of records per page (default: 10)
 * - page (optional): Page number (default: 1)
 * - month (optional): Month in MM format (default: current month)
 * - year (optional): Year in YYYY format (default: current year)
 * - department (optional): Filter by department name
 * - employeeId (optional): Get specific employee salary data
 * - status (optional): Filter by payment status ('paid', 'unpaid', 'all')
 * 
 * Sample Request:
 * GET /api/v1/salaries/employees?month=10&year=2025&department=Livestock&limit=20&page=1&status=unpaid
 * 
 * Sample Response:
 * {
 *   "success": true,
 *   "statusCode": 200,
 *   "message": "Employee salaries list fetched successfully.",
 *   "type": "employeeSalaries",
 *   "data": {
 *     "employees": [
 *       {
 *         "employeeId": "uuid-here",
 *         "name": "John Doe",
 *         "designation": "Farm Manager",
 *         "department": "Livestock",
 *         "totalDaysInMonth": 31,
 *         "allowedLeaves": 2,
 *         "workingDays": 29,
 *         "presentDays": 26,
 *         "absentDays": 3,
 *         "leaveDays": 2,
 *         "baseSalary": 50000,
 *         "salaryPerDay": 1724.14,
 *         "deduction": 5000,
 *         "bonus": 2000,
 *         "overtime": 1500,
 *         "grossSalary": 43327.64,
 *         "status": "unpaid",
 *         "month": "2025-10",
 *         "financialMetrics": {
 *           "effectiveWorkingDays": 26,
 *           "salaryEfficiency": 84,
 *           "netSalary": 43327.64,
 *           "advanceRatio": 10,
 *           "overtimeValue": 1500,
 *           "bonusValue": 2000
 *         }
 *       }
 *     ],
 *     "summary": {
 *       "totalEmployees": 25,
 *       "totalBaseSalary": 1250000,
 *       "totalGrossSalary": 1085000,
 *       "totalDeductions": 125000,
 *       "totalBonuses": 50000,
 *       "totalOvertime": 37500,
 *       "averageAttendance": 24.5,
 *       "monthYear": "2025-10",
 *       "daysInMonth": 31
 *     },
 *     "pagination": {
 *       "page": 1,
 *       "totalPages": 3,
 *       "limit": 10,
 *       "skip": 0,
 *       "totalCount": 25
 *     },
 *     "financialInsights": {
 *       "payrollCost": 1085000,
 *       "laborCostPerDay": 40322.58,
 *       "effectivePayrollCost": 960000,
 *       "bonusExpense": 50000,
 *       "overtimeExpense": 37500,
 *       "advanceRecovery": 125000
 *     }
 *   }
 * }
 * 
 * Field Descriptions:
 * 
 * Employee Fields:
 * - employeeId: Unique identifier for the employee
 * - name: Employee's full name
 * - designation: Job title/position
 * - department: Department name
 * - totalDaysInMonth: Total days in the current month
 * - allowedLeaves: Number of leave days allowed per month
 * - workingDays: Expected working days (totalDaysInMonth - allowedLeaves)
 * - presentDays: Actual days present (from attendance records)
 * - absentDays: Days marked absent
 * - leaveDays: Days on leave
 * - baseSalary: Monthly base salary
 * - salaryPerDay: Calculated daily salary (baseSalary / workingDays)
 * - deduction: Total deductions (advance salary, loans, etc.)
 * - bonus: Bonus amount for the month
 * - overtime: Overtime payment
 * - grossSalary: Final calculated salary after all adjustments
 * - status: Payment status ('paid', 'unpaid', 'calculated')
 * - month: Month-Year for which salary is calculated
 * 
 * Financial Metrics (per employee):
 * - effectiveWorkingDays: Actual working days
 * - salaryEfficiency: Attendance percentage
 * - netSalary: Final take-home salary
 * - advanceRatio: Percentage of advance taken vs base salary
 * - overtimeValue: Overtime earnings
 * - bonusValue: Bonus earnings
 * 
 * Summary Metrics:
 * - totalEmployees: Count of employees in the result
 * - totalBaseSalary: Sum of all base salaries
 * - totalGrossSalary: Sum of all gross salaries
 * - totalDeductions: Sum of all deductions
 * - totalBonuses: Sum of all bonuses
 * - totalOvertime: Sum of all overtime payments
 * - averageAttendance: Average attendance across all employees
 * 
 * Financial Insights (for Finance Module Integration):
 * - payrollCost: Total payroll expense for the month
 * - laborCostPerDay: Average daily labor cost
 * - effectivePayrollCost: Net payroll cost after deductions
 * - bonusExpense: Total bonus expense
 * - overtimeExpense: Total overtime expense
 * - advanceRecovery: Total advance salary recovery
 * 
 * Usage Examples:
 * 
 * 1. Get current month salaries:
 *    GET /api/v1/salaries/employees
 * 
 * 2. Get specific month/year:
 *    GET /api/v1/salaries/employees?month=09&year=2025
 * 
 * 3. Filter by department:
 *    GET /api/v1/salaries/employees?department=Livestock
 * 
 * 4. Get unpaid salaries only:
 *    GET /api/v1/salaries/employees?status=unpaid
 * 
 * 5. Get specific employee:
 *    GET /api/v1/salaries/employees?employeeId=uuid-here
 * 
 * 6. Pagination:
 *    GET /api/v1/salaries/employees?page=2&limit=20
 * 
 * Finance Module Integration:
 * This endpoint is designed to provide all necessary data for financial reporting:
 * - Expense categorization (payroll, bonuses, overtime)
 * - Cash flow tracking (deductions, advances)
 * - Monthly/yearly financial summaries
 * - Labor cost analysis
 * - Budget planning data
 * 
 * Error Responses:
 * - 400: Invalid parameters or unauthorized access
 * - 404: No employees found
 * - 500: Server error
 */

// Example usage with fetch
/* eslint-disable no-unused-vars */
const getEmployeeSalaries = async (month = '10', year = '2025', status = 'all') => {
    try {
        const response = await fetch(`/api/v1/salaries/employees?month=${month}&year=${year}&status=${status}`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer your-jwt-token-here',
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log('Employee Salaries:', data.data);
            return data.data;
        } else {
            console.error('Error:', data.message);
            return null;
        }
    } catch (error) {
        console.error('Network Error:', error);
        return null;
    }
};

// Example with axios
import axios from 'axios';

const getEmployeeSalariesWithAxios = async (filters = {}) => {
    try {
        const {
            month = new Date().getMonth() + 1,
            year = new Date().getFullYear(),
            department,
            status = 'all',
            page = 1,
            limit = 10
        } = filters;

        const params = new URLSearchParams({
            month: month.toString().padStart(2, '0'),
            year: year.toString(),
            page: page.toString(),
            limit: limit.toString(),
            status
        });

        if (department) params.append('department', department);

        const response = await axios.get(`/api/v1/salaries/employees?${params}`, {
            headers: {
                'Authorization': 'Bearer your-jwt-token-here'
            }
        });
        
        return response.data.data;
    } catch (error) {
        console.error('Error fetching employee salaries:', error.response?.data || error.message);
        throw error;
    }
};
