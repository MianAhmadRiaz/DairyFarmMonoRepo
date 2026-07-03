import { Op } from "sequelize";
import sequelize from "../../../config/db.js";
import Employee from "../../../models/employee.js";
import Attendance from "../../../models/attendance.js";
import SalaryInvoice from "../../../models/salaryInvoice.js";
import SalaryAdvance from "../../../models/advanceSalary.js";
import { getUserById } from "../../../repo/user.js";
import { ApiError } from "../../../utils/ApiError.js";
import sendSuccessResponse from "../../../utils/responses/sendSuccessResponse.js";

const getEmployeeDashboard = async (req, res, next) => {
    try {
        const { userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);

        // Get current date for attendance calculations
        const today = new Date();
        const currentYear = today.getFullYear();
        const todayDateOnly = today.toISOString().split('T')[0]; // YYYY-MM-DD format
        
        // Start building dashboard data
        const dashboardData = {};

        try {
            // 1. Total employees (active employees only)
            const totalEmployees = await Employee.count({
                where: { 
                    farmId, 
                    isDeleted: false 
                }
            });

            // 2. Present employee count (current day)
            const presentToday = await Attendance.count({
                where: {
                    farmId,
                    date: {
                        [Op.gte]: new Date(todayDateOnly + 'T00:00:00.000Z'),
                        [Op.lt]: new Date(new Date(todayDateOnly + 'T00:00:00.000Z').getTime() + 24 * 60 * 60 * 1000)
                    },
                    status: 'present'
                }
            });

            // 3. Absent employee count (current day)
            const absentToday = await Attendance.count({
                where: {
                    farmId,
                    date: {
                        [Op.gte]: new Date(todayDateOnly + 'T00:00:00.000Z'),
                        [Op.lt]: new Date(new Date(todayDateOnly + 'T00:00:00.000Z').getTime() + 24 * 60 * 60 * 1000)
                    },
                    status: 'absent'
                }
            });

            // 4. Leave (currently on leave employee count)
            const onLeaveToday = await Attendance.count({
                where: {
                    farmId,
                    date: {
                        [Op.gte]: new Date(todayDateOnly + 'T00:00:00.000Z'),
                        [Op.lt]: new Date(new Date(todayDateOnly + 'T00:00:00.000Z').getTime() + 24 * 60 * 60 * 1000)
                    },
                    status: 'leave'
                }
            });

            // 5. Total salary paid in PKR (all time)
            const totalSalaryPaidResult = await SalaryInvoice.findOne({
                where: {
                    farmId,
                    status: 'paid'
                },
                attributes: [
                    [sequelize.fn('SUM', sequelize.col('gross_salary')), 'totalPaid']
                ],
                raw: true
            });
            const totalSalaryPaid = parseFloat(totalSalaryPaidResult?.totalPaid || 0);

            // 6. Pending salaries of employees (unpaid salary invoices)
            const pendingSalariesResult = await SalaryInvoice.findOne({
                where: {
                    farmId,
                    status: 'unpaid'
                },
                attributes: [
                    [sequelize.fn('SUM', sequelize.col('gross_salary')), 'totalPending']
                ],
                raw: true
            });
            const pendingSalariesAmount = parseFloat(pendingSalariesResult?.totalPending || 0);

            // Count of employees with pending salaries
            const employeesWithPendingSalaries = await SalaryInvoice.count({
                where: {
                    farmId,
                    status: 'unpaid'
                },
                distinct: true,
                col: 'employee_id'
            });

            // 7. Advance salary - count of employees who took advance
            const employeesWithAdvance = await SalaryAdvance.count({
                where: {
                    farmId,
                    isDeleted: false
                },
                distinct: true,
                col: 'employee_id'
            });

            // Total advance amount given
            const totalAdvanceResult = await SalaryAdvance.findOne({
                where: {
                    farmId,
                    isDeleted: false
                },
                attributes: [
                    [sequelize.fn('SUM', sequelize.col('amount')), 'totalAdvance']
                ],
                raw: true
            });
            const totalAdvanceAmount = parseFloat(totalAdvanceResult?.totalAdvance || 0);

            // 8. Total salary paid in current year
            const yearStart = new Date(currentYear, 0, 1); // January 1st of current year
            const yearEnd = new Date(currentYear + 1, 0, 1); // January 1st of next year

            const currentYearSalaryResult = await SalaryInvoice.findOne({
                where: {
                    farmId,
                    status: 'paid',
                    paid_at: {
                        [Op.gte]: yearStart,
                        [Op.lt]: yearEnd
                    }
                },
                attributes: [
                    [sequelize.fn('SUM', sequelize.col('gross_salary')), 'yearlyTotal']
                ],
                raw: true
            });
            const currentYearSalaryPaid = parseFloat(currentYearSalaryResult?.yearlyTotal || 0);

            // Calculate additional useful metrics
            const notMarkedToday = totalEmployees - (presentToday + absentToday + onLeaveToday);

            // Get monthly salary cost
            const monthlySalaryCost = await calculateMonthlySalaryCost(farmId);

            // Build response object
            dashboardData.summary = {
                totalEmployees,
                totalSalaryPaidPKR: totalSalaryPaid,
                currentYearSalaryPaidPKR: currentYearSalaryPaid,
                pendingSalariesAmountPKR: pendingSalariesAmount,
                totalAdvanceAmountPKR: totalAdvanceAmount
            };

            dashboardData.todayAttendance = {
                present: presentToday,
                absent: absentToday,
                onLeave: onLeaveToday,
                notMarked: notMarkedToday,
                attendancePercentage: totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 0
            };

            dashboardData.salaryMetrics = {
                employeesWithPendingSalaries,
                employeesWithAdvanceCount: employeesWithAdvance,
                averageSalaryPerEmployee: totalEmployees > 0 ? Math.round(totalSalaryPaid / totalEmployees) : 0
            };

            // Additional financial insights for the future finance module
            dashboardData.financialInsights = {
                monthlySalaryCost,
                salaryExpensePercentage: await calculateSalaryExpensePercentage(farmId, currentYearSalaryPaid),
                avgAdvancePerEmployee: employeesWithAdvance > 0 ? Math.round(totalAdvanceAmount / employeesWithAdvance) : 0,
                cashFlowImpact: {
                    totalOutflow: totalSalaryPaid + totalAdvanceAmount,
                    pendingOutflow: pendingSalariesAmount,
                    monthlyCommitment: monthlySalaryCost
                }
            };

            // Additional metrics for HR and financial planning
            dashboardData.insights = {
                productivity: {
                    attendanceRate: totalEmployees > 0 ? Math.round(((presentToday / totalEmployees) * 100)) : 0,
                    leaveRate: totalEmployees > 0 ? Math.round(((onLeaveToday / totalEmployees) * 100)) : 0,
                    absenteeismRate: totalEmployees > 0 ? Math.round(((absentToday / totalEmployees) * 100)) : 0
                },
                financial: {
                    salaryPerEmployee: monthlySalaryCost > 0 && totalEmployees > 0 ? Math.round(monthlySalaryCost / totalEmployees) : 0,
                    advanceUtilization: totalEmployees > 0 ? Math.round((employeesWithAdvance / totalEmployees) * 100) : 0,
                    pendingSalaryRatio: totalSalaryPaid > 0 ? Math.round((pendingSalariesAmount / (totalSalaryPaid + pendingSalariesAmount)) * 100) : 0
                }
            };

            return sendSuccessResponse(res, 200, true, "Employee dashboard data fetched successfully.", "employeeDashboard", dashboardData);

        } catch (dbError) {
            console.error("Database error in employee dashboard:", dbError);
            throw new ApiError("Database Error", 500, "Error fetching employee dashboard data. Please try again.", true);
        }

    } catch (error) {
        next(error);
    }
};

// Helper function to calculate monthly salary cost (sum of all employee base salaries)
const calculateMonthlySalaryCost = async (farmId) => {
    try {
        const result = await Employee.findOne({
            where: {
                farmId,
                isDeleted: false
            },
            attributes: [
                [sequelize.fn('SUM', sequelize.col('salary')), 'monthlyCost']
            ],
            raw: true
        });
        return parseFloat(result?.monthlyCost || 0);
    } catch (error) {
        console.error("Error calculating monthly salary cost:", error);
        return 0;
    }
};

// Helper function to calculate salary expense percentage (for future finance module integration)
const calculateSalaryExpensePercentage = async (_farmId, _yearlyTotal) => {
    // This is a placeholder calculation for future finance module integration
    // In the future, this could be calculated against total farm revenue/expenses
    // For now, we'll return a calculation based on available data

    // Example: If we had total farm expenses, we could calculate:
    // const totalExpenses = await getTotalFarmExpenses(_farmId);
    // return totalExpenses > 0 ? Math.round((_yearlyTotal / totalExpenses) * 100) : 0;

    return 0; // Will be implemented when finance module is added
};

export default getEmployeeDashboard;
