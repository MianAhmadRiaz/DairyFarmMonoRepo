import { Op } from "sequelize";
import sequelize from "../../../config/db.js";
import { getUserById } from "../../../repo/user.js";
import { ApiError } from "../../../utils/ApiError.js";
import sendSuccessResponse from "../../../utils/responses/sendSuccessResponse.js";
import Employee from "../../../models/employee.js";
import SalaryInvoice from "../../../models/salaryInvoice.js";
import AdvanceTransaction from "../../../models/advanceTransaction.js";
import { recordAdvanceReceived } from "../../../utils/finance/financeHooks.js";

const batchGenerateSalaries = async (req, res, next) => {
    try {
        const { userId, body: { employees, month, year, skipAdvanceDeductionForEmployees = [] } } = req;
        
        if (!employees || !Array.isArray(employees)) {
            throw new ApiError("Invalid Data", 400, "Employees array is required", true);
        }

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

        const generatedInvoices = [];
        const errors = [];

        // Process each employee
        for (const empData of employees) {
            try {
                // Verify employee exists and belongs to this farm
                const employee = await Employee.findOne({ 
                    where: { 
                        uuid: empData.employeeId, 
                        farmId, 
                        isDeleted: false 
                    } 
                });

                if (!employee) {
                    errors.push({
                        employeeId: empData.employeeId,
                        error: "Employee not found or doesn't belong to this farm"
                    });
                    continue;
                }

                // Check if salary invoice already exists for this month
                const existingInvoice = await SalaryInvoice.findOne({
                    where: {
                        farmId,
                        employee_id: empData.employeeId,
                        month: monthYear,
                        isDeleted: false
                    }
                });

                if (existingInvoice) {
                    errors.push({
                        employeeId: empData.employeeId,
                        employeeName: employee.name,
                        error: `Salary invoice already exists for ${monthYear}`
                    });
                    continue;
                }

                // Handle advance deduction logic
                let finalDeduction = empData.deduction || 0;
                let advanceDeducted = 0;
                let advanceBalance = null;

                // Check if this employee should skip advance deduction for this month
                const skipAdvanceDeduction = skipAdvanceDeductionForEmployees.includes(empData.employeeId);

                if (!skipAdvanceDeduction) {
                    // Calculate advance balance that should be deducted
                    advanceBalance = await calculateEmployeeAdvanceBalance(farmId, empData.employeeId, monthYear);
                    advanceDeducted = parseFloat(advanceBalance.deductionAmount) || 0;

                    // Add advance deduction to other deductions
                    finalDeduction = parseFloat(finalDeduction) + advanceDeducted;
                }

                // Create salary invoice with edited data
                const invoiceData = {
                    createdBy: user.uuid,
                    updatedBy: user.uuid,
                    farmId,
                    employee_id: empData.employeeId,
                    name: employee.name,
                    month: monthYear,
                    expense_head: "Employee Salary",
                    base_salary: empData.baseSalary || employee.salary || 0,
                    total_days: daysInMonth,
                    present_days: empData.presentDays || 0,
                    absence_days: daysInMonth - (empData.presentDays || 0),
                    leave_allowance: employee.leave_allow || 0,
                    salary_days: empData.presentDays || 0,
                    deduction: finalDeduction,
                    overtime: empData.overtime || 0,
                    bonus: empData.bonus || 0,
                    gross_salary: empData.grossSalary || 0,
                    status: "unpaid",
                    advance_deduction_skipped: skipAdvanceDeduction
                };

                const newInvoice = await SalaryInvoice.create(invoiceData);

                // Write back the advance recovery so the outstanding balance
                // actually shrinks — otherwise the same advance would be
                // deducted again every month.
                if (advanceDeducted > 0) {
                    const now = new Date();
                    const fy = now.getMonth() >= 3 ? `${now.getFullYear()}-${now.getFullYear() + 1}` : `${now.getFullYear() - 1}-${now.getFullYear()}`;
                    await AdvanceTransaction.create({
                        farmId,
                        employee_id: empData.employeeId,
                        transaction_type: 'received',
                        amount: advanceDeducted,
                        transaction_date: now,
                        payment_method: 'other',
                        description: `Recovered via salary deduction (${monthYear}), invoice ${newInvoice.uuid}`,
                        deduct_from_salary: false,
                        status: 'active',
                        expense_category: 'Advance Recovery',
                        financial_year: fy,
                        createdBy: user.uuid,
                        updatedBy: user.uuid,
                    });
                    // Fully recovered? Close out the outstanding 'given' advances.
                    if (advanceBalance && advanceDeducted >= advanceBalance.outstanding) {
                        await AdvanceTransaction.update(
                            { status: 'fully_recovered', updatedBy: user.uuid },
                            { where: { farmId, employee_id: empData.employeeId, transaction_type: 'given', status: 'active', isDeleted: false } }
                        );
                    }
                    // Ledger: Dr Cash / Cr Employee Advances (non-blocking)
                    await recordAdvanceReceived({
                        farmId,
                        userId,
                        amount: advanceDeducted,
                        referenceId: newInvoice.uuid,
                        description: `Advance recovered via salary - ${employee.name} (${monthYear})`,
                    });
                }

                generatedInvoices.push({
                    invoiceId: newInvoice.uuid,
                    employeeId: empData.employeeId,
                    employeeName: employee.name,
                    grossSalary: newInvoice.gross_salary,
                    month: monthYear
                });

            } catch (empError) {
                errors.push({
                    employeeId: empData.employeeId,
                    error: empError.message || "Error generating salary invoice"
                });
            }
        }

        const responseData = {
            generatedInvoices,
            errors,
            summary: {
                totalProcessed: employees.length,
                successful: generatedInvoices.length,
                failed: errors.length,
                totalGrossSalary: generatedInvoices.reduce((sum, inv) => sum + parseFloat(inv.grossSalary), 0),
                month: monthYear
            }
        };

        const message = errors.length > 0 
            ? `Batch salary generation completed with ${errors.length} errors.`
            : "All salary invoices generated successfully.";

        return sendSuccessResponse(res, 201, true, message, "batchSalaryGeneration", responseData);
    } catch (error) {
        next(error);
    }
};

// Helper function to calculate employee's advance balance for salary deduction
const calculateEmployeeAdvanceBalance = async (farmId, employeeId, currentMonth) => {
    // Get all advance transactions that should be deducted from salary
    const advanceTransactions = await AdvanceTransaction.findAll({
        where: {
            farmId,
            employee_id: employeeId,
            transaction_type: 'given',
            deduct_from_salary: true,
            status: 'active',
            isDeleted: false,
            [Op.or]: [
                { deduction_start_month: { [Op.lte]: currentMonth } },
                { deduction_start_month: null }
            ]
        },
        raw: true
    });

    // Get total payments received from employee
    const totalReceived = await AdvanceTransaction.findOne({
        where: {
            farmId,
            employee_id: employeeId,
            transaction_type: 'received',
            isDeleted: false
        },
        attributes: [
            [sequelize.fn('SUM', sequelize.col('amount')), 'total']
        ],
        raw: true
    });

    const totalAdvanceGiven = advanceTransactions.reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0);
    const totalAdvanceReceived = parseFloat(totalReceived?.total || 0);
    const outstandingAdvance = totalAdvanceGiven - totalAdvanceReceived;

    // Calculate deduction amount for this month
    let deductionAmount = 0;
    
    if (outstandingAdvance > 0) {
        // Check if any transaction has monthly deduction amount specified
        const monthlyDeductions = advanceTransactions.filter(t => t.monthly_deduction_amount > 0);
        
        if (monthlyDeductions.length > 0) {
            // Use specified monthly deduction amounts
            deductionAmount = monthlyDeductions.reduce((sum, transaction) => {
                return sum + parseFloat(transaction.monthly_deduction_amount);
            }, 0);
        } else {
            // Default: deduct full outstanding amount
            deductionAmount = outstandingAdvance;
        }
        
        // Ensure deduction doesn't exceed outstanding balance
        deductionAmount = Math.min(deductionAmount, outstandingAdvance);
    }

    return {
        totalGiven: totalAdvanceGiven,
        totalReceived: totalAdvanceReceived,
        outstanding: outstandingAdvance,
        deductionAmount: Math.max(0, deductionAmount)
    };
};

export default batchGenerateSalaries;