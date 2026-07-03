import { Op } from "sequelize";
import sequelize from "../../../config/db.js";
import Employee from "../../../models/employee.js";
import SalaryInvoice from "../../../models/salaryInvoice.js";
import SalaryAdvance from "../../../models/advanceSalary.js";
import Attendance from "../../../models/attendance.js";
import { getUserById } from "../../../repo/user.js";
import { ApiError } from "../../../utils/ApiError.js";
import sendSuccessResponse from "../../../utils/responses/sendSuccessResponse.js";

const getEmployeeSalariesList = async (req, res, next) => {
    try {
        const { 
            query: { 
                limit = 10, 
                page = 1, 
                month, 
                year,
                department,
                employeeId,
                status // paid, unpaid, all
            }, 
            userId 
        } = req;
        
        const offset = (page - 1) * limit;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);

        // Get current month and year if not provided
        const currentDate = new Date();
        const currentMonth = month || (currentDate.getMonth() + 1).toString().padStart(2, '0');
        const currentYear = year || currentDate.getFullYear().toString();
        const monthYear = `${currentYear}-${currentMonth}`;
        
        // Calculate days in the current month
        const daysInMonth = new Date(parseInt(currentYear), parseInt(currentMonth), 0).getDate();

        // Build where conditions for employees
        const employeeWhere = { 
            farmId, 
            isDeleted: false 
        };
        
        if (department) {
            employeeWhere.department = department;
        }
        
        if (employeeId) {
            employeeWhere.uuid = employeeId;
        }

        // Get employees with their salary data
        const employees = await Employee.findAll({
            where: employeeWhere,
            attributes: [
                'uuid', 'name', 'designation', 'department', 
                'salary', 'leave_allow', 'opening_advance'
            ],
            offset,
            limit,
            order: [['name', 'ASC']],
            raw: true
        });

        // Get total count for pagination
        const totalEmployees = await Employee.count({ where: employeeWhere });

        if (employees.length === 0) {
            return sendSuccessResponse(res, 200, true, "No employees found.", "employeeSalaries", {
                employees: [],
                pagination: {
                    page: Number(page),
                    totalPages: 0,
                    limit: Number(limit),
                    skip: offset,
                    totalCount: 0,
                }
            });
        }

        const employeeIds = employees.map(emp => emp.uuid);

        // Get salary invoices for the specified month/year
        const salaryInvoices = await SalaryInvoice.findAll({
            where: {
                farmId,
                employee_id: { [Op.in]: employeeIds },
                month: monthYear,
                isDeleted: false
            },
            raw: true
        });

        // Get advance salary data for each employee
        const advanceSalaries = await SalaryAdvance.findAll({
            where: {
                farmId,
                employee_id: { [Op.in]: employeeIds },
                isDeleted: false,
                date: {
                    [Op.between]: [
                        new Date(`${currentYear}-${currentMonth}-01`),
                        new Date(`${currentYear}-${currentMonth}-${daysInMonth}`)
                    ]
                }
            },
            attributes: [
                'employee_id',
                [sequelize.fn('SUM', sequelize.col('amount')), 'totalAdvance']
            ],
            group: ['employee_id'],
            raw: true
        });

        // Get attendance data for the current month
        const attendanceData = await Attendance.findAll({
            where: {
                farmId,
                employee_id: { [Op.in]: employeeIds },
                date: {
                    [Op.between]: [
                        new Date(`${currentYear}-${currentMonth}-01`),
                        new Date(`${currentYear}-${currentMonth}-${daysInMonth}`)
                    ]
                }
            },
            attributes: [
                'employee_id',
                'status',
                [sequelize.fn('COUNT', sequelize.col('status')), 'count']
            ],
            group: ['employee_id', 'status'],
            raw: true
        });

        // Process data for each employee
        const employeeSalariesData = employees.map(employee => {
            // Find salary invoice for this employee
            const salaryInvoice = salaryInvoices.find(invoice => invoice.employee_id === employee.uuid);
            
            // Find advance salary for this employee
            const advanceSalary = advanceSalaries.find(advance => advance.employee_id === employee.uuid);
            const totalAdvance = advanceSalary ? parseFloat(advanceSalary.totalAdvance) : 0;
            
            // Calculate attendance
            const employeeAttendance = attendanceData.filter(att => att.employee_id === employee.uuid);
            const presentDays = employeeAttendance.find(att => att.status === 'present')?.count || 0;
            const absentDays = employeeAttendance.find(att => att.status === 'absent')?.count || 0;
            const leaveDays = employeeAttendance.find(att => att.status === 'leave')?.count || 0;
            
            // Calculate salary metrics
            const baseSalary = employee.salary || 0;
            const allowedLeaves = employee.leave_allow || 0;
            const workingDays = daysInMonth - allowedLeaves;
            const salaryPerDay = workingDays > 0 ? baseSalary / workingDays : 0;
            
            // Use salary invoice data if available, otherwise calculate from base data
            let finalData = {
                employeeId: employee.uuid,
                name: employee.name,
                designation: employee.designation,
                department: employee.department,
                totalDaysInMonth: daysInMonth,
                allowedLeaves: allowedLeaves,
                workingDays: workingDays,
                presentDays: parseInt(presentDays),
                absentDays: parseInt(absentDays),
                leaveDays: parseInt(leaveDays),
                baseSalary: baseSalary,
                salaryPerDay: Math.round(salaryPerDay * 100) / 100,
                deduction: totalAdvance, // Advance salary as deduction
                bonus: 0,
                overtime: 0,
                grossSalary: 0,
                status: 'calculated', // indicates this is calculated, not from invoice
                month: monthYear
            };

            if (salaryInvoice) {
                // Use actual salary invoice data
                finalData = {
                    ...finalData,
                    totalDaysInMonth: salaryInvoice.total_days || daysInMonth,
                    presentDays: salaryInvoice.present_days || presentDays,
                    absentDays: salaryInvoice.absence_days || absentDays,
                    baseSalary: salaryInvoice.base_salary || baseSalary,
                    salaryPerDay: salaryInvoice.total_days > 0 ? 
                        Math.round((salaryInvoice.base_salary / salaryInvoice.total_days) * 100) / 100 : 0,
                    deduction: salaryInvoice.deduction || totalAdvance,
                    bonus: salaryInvoice.bonus || 0,
                    overtime: salaryInvoice.overtime || 0,
                    grossSalary: salaryInvoice.gross_salary || 0,
                    status: salaryInvoice.status === 'paid' ? 'paid' : 'unpaid',
                    paidAt: salaryInvoice.paid_at || null,
                    invoiceId: salaryInvoice.uuid
                };
            } else {
                // Calculate gross salary for non-invoiced employees
                const workingSalary = presentDays * salaryPerDay;
                finalData.grossSalary = Math.round((workingSalary + finalData.bonus + finalData.overtime - finalData.deduction) * 100) / 100;
            }

            // Add financial insights for future finance module integration
            finalData.financialMetrics = {
                effectiveWorkingDays: finalData.presentDays,
                salaryEfficiency: finalData.totalDaysInMonth > 0 ? 
                    Math.round((finalData.presentDays / finalData.totalDaysInMonth) * 100) : 0,
                netSalary: finalData.grossSalary,
                advanceRatio: finalData.baseSalary > 0 ? 
                    Math.round((totalAdvance / finalData.baseSalary) * 100) : 0,
                overtimeValue: finalData.overtime,
                bonusValue: finalData.bonus
            };

            return finalData;
        });

        // Filter by status if provided
        let filteredData = employeeSalariesData;
        if (status && status !== 'all') {
            if (status === 'paid') {
                filteredData = employeeSalariesData.filter(emp => emp.status === 'paid');
            } else if (status === 'unpaid') {
                filteredData = employeeSalariesData.filter(emp => emp.status === 'unpaid' || emp.status === 'calculated');
            }
        }

        // Calculate summary metrics
        const summaryMetrics = {
            totalEmployees: filteredData.length,
            totalBaseSalary: filteredData.reduce((sum, emp) => sum + emp.baseSalary, 0),
            totalGrossSalary: filteredData.reduce((sum, emp) => sum + emp.grossSalary, 0),
            totalDeductions: filteredData.reduce((sum, emp) => sum + emp.deduction, 0),
            totalBonuses: filteredData.reduce((sum, emp) => sum + emp.bonus, 0),
            totalOvertime: filteredData.reduce((sum, emp) => sum + emp.overtime, 0),
            averageAttendance: filteredData.length > 0 ? 
                Math.round((filteredData.reduce((sum, emp) => sum + emp.presentDays, 0) / filteredData.length) * 100) / 100 : 0,
            monthYear: monthYear,
            daysInMonth: daysInMonth
        };

        const totalPages = Math.ceil(totalEmployees / limit);

        const responseData = {
            employees: filteredData,
            summary: summaryMetrics,
            pagination: {
                page: Number(page),
                totalPages: Number(totalPages),
                limit: Number(limit),
                skip: offset,
                totalCount: Number(totalEmployees),
            },
            // Financial insights for future finance module integration
            financialInsights: {
                payrollCost: summaryMetrics.totalGrossSalary,
                laborCostPerDay: daysInMonth > 0 ? Math.round((summaryMetrics.totalBaseSalary / daysInMonth) * 100) / 100 : 0,
                effectivePayrollCost: summaryMetrics.totalGrossSalary - summaryMetrics.totalDeductions,
                bonusExpense: summaryMetrics.totalBonuses,
                overtimeExpense: summaryMetrics.totalOvertime,
                advanceRecovery: summaryMetrics.totalDeductions
            }
        };

        return sendSuccessResponse(res, 200, true, "Employee salaries list fetched successfully.", "employeeSalaries", responseData);
    } catch (error) {
        next(error);
    }
};

export default getEmployeeSalariesList;
