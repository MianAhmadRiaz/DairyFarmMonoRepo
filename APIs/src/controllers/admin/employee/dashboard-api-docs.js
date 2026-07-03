/**
 * Employee Dashboard API Documentation
 * 
 * Endpoint: GET /api/employees/dashboard
 * Authentication: Required (Bearer Token)
 * 
 * Description: Provides comprehensive dashboard metrics for employee management
 * 
 * Sample Response:
 * {
 *   "success": true,
 *   "statusCode": 200,
 *   "message": "Employee dashboard data fetched successfully.",
 *   "type": "employeeDashboard",
 *   "data": {
 *     "summary": {
 *       "totalEmployees": 25,
 *       "totalSalaryPaidPKR": 750000.00,
 *       "currentYearSalaryPaidPKR": 180000.00,
 *       "pendingSalariesAmountPKR": 45000.00,
 *       "totalAdvanceAmountPKR": 15000.00
 *     },
 *     "todayAttendance": {
 *       "present": 20,
 *       "absent": 3,
 *       "onLeave": 1,
 *       "notMarked": 1,
 *       "attendancePercentage": 80
 *     },
 *     "salaryMetrics": {
 *       "employeesWithPendingSalaries": 5,
 *       "employeesWithAdvanceCount": 3,
 *       "averageSalaryPerEmployee": 30000
 *     },
 *     "financialInsights": {
 *       "monthlySalaryCost": 725000.00,
 *       "salaryExpensePercentage": 0,
 *       "avgAdvancePerEmployee": 5000
 *     }
 *   }
 * }
 * 
 * Field Descriptions:
 * 
 * summary:
 * - totalEmployees: Total active employees in the farm
 * - totalSalaryPaidPKR: Total salary paid (all time) in Pakistani Rupees
 * - currentYearSalaryPaidPKR: Total salary paid in current year
 * - pendingSalariesAmountPKR: Total unpaid salary amount
 * - totalAdvanceAmountPKR: Total advance salary given
 * 
 * todayAttendance:
 * - present: Employees marked present today
 * - absent: Employees marked absent today  
 * - onLeave: Employees on leave today
 * - notMarked: Employees not marked for attendance today
 * - attendancePercentage: Percentage of employees present today
 * 
 * salaryMetrics:
 * - employeesWithPendingSalaries: Count of employees with unpaid salaries
 * - employeesWithAdvanceCount: Count of employees who have taken advance salary
 * - averageSalaryPerEmployee: Average salary per employee (based on total paid)
 * 
 * financialInsights: (Future Finance Module Integration)
 * - monthlySalaryCost: Total monthly salary cost (sum of all employee base salaries)
 * - salaryExpensePercentage: Placeholder for salary expense percentage (will be calculated against total farm expenses in finance module)
 * - avgAdvancePerEmployee: Average advance amount per employee who took advance
 * 
 * Usage Examples:
 * 
 * 1. Frontend Dashboard: Display these metrics on employee management dashboard
 * 2. Financial Planning: Use monthlySalaryCost for budget planning
 * 3. HR Management: Monitor attendance percentages and pending salaries
 * 4. Payroll Management: Track advance salaries and pending payments
 * 
 * Integration with Future Finance Module:
 * The API is designed to be compatible with a future finance module by:
 * - Including expense categorization (salary expenses)
 * - Providing financial insights structure
 * - Tracking monetary flows (paid salaries, advances, pending amounts)
 * - Supporting financial reporting and analysis
 */

// Example API call using fetch
/* eslint-disable no-unused-vars */
const getEmployeeDashboard = async () => {
    try {
        const response = await fetch('/api/employees/dashboard', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer your-jwt-token-here',
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log('Dashboard Data:', data.data);
            // Use the dashboard data to populate your frontend
        } else {
            console.error('Error:', data.message);
        }
    } catch (error) {
        console.error('Network Error:', error);
    }
};

// Example using axios
import axios from 'axios';

const getDashboardWithAxios = async () => {
    try {
        const response = await axios.get('/api/employees/dashboard', {
            headers: {
                'Authorization': 'Bearer your-jwt-token-here'
            }
        });
        
        return response.data.data; // Return the dashboard data
    } catch (error) {
        console.error('Error fetching dashboard:', error.response?.data || error.message);
        throw error;
    }
};
