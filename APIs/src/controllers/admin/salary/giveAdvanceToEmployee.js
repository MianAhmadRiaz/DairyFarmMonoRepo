import sequelize from "../../../config/db.js";
import { getUserById } from "../../../repo/user.js";
import { ApiError } from "../../../utils/ApiError.js";
import sendSuccessResponse from "../../../utils/responses/sendSuccessResponse.js";
import Employee from "../../../models/employee.js";
import AdvanceTransaction from "../../../models/advanceTransaction.js";
import { recordAdvanceGiven } from "../../../utils/finance/financeHooks.js";

const giveAdvanceToEmployee = async (req, res, next) => {
    try {
        const { userId, body: { 
            employeeId, 
            amount, 
            transaction_date,
            payment_method = 'cash',
            reference_number,
            description,
            deduct_from_salary = true,
            deduction_start_month,
            monthly_deduction_amount
        } } = req;

        // Validations
        if (!employeeId) throw new ApiError("Invalid Data", 400, "Employee ID is required", true);
        if (!amount || amount <= 0) throw new ApiError("Invalid Data", 400, "Valid amount is required", true);

        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);

        // Verify employee exists and belongs to this farm
        const employee = await Employee.findOne({
            where: { uuid: employeeId, farmId, isDeleted: false }
        });

        if (!employee) {
            throw new ApiError("Invalid Data", 400, "Employee not found or doesn't belong to this farm", true);
        }

        // Calculate financial year (assuming April to March cycle, adjust as needed)
        const transactionDate = transaction_date ? new Date(transaction_date) : new Date();
        const year = transactionDate.getFullYear();
        const month = transactionDate.getMonth(); // 0-based
        const financialYear = month >= 3 ? `${year}-${year + 1}` : `${year - 1}-${year}`; // April to March

        // Create advance transaction record
        const advanceData = {
            farmId,
            employee_id: employeeId,
            transaction_type: 'given',
            amount: parseFloat(amount),
            transaction_date: transactionDate,
            reference_number,
            payment_method,
            description: description || `Advance salary given to ${employee.name}`,
            deduct_from_salary,
            deduction_start_month,
            monthly_deduction_amount: monthly_deduction_amount ? parseFloat(monthly_deduction_amount) : null,
            status: 'active',
            expense_category: 'Employee Advance',
            financial_year: financialYear,
            createdBy: user.uuid,
            updatedBy: user.uuid
        };

        const newAdvanceTransaction = await AdvanceTransaction.create(advanceData);

        // Finance automation: record the advance as an employee receivable (non-blocking)
        await recordAdvanceGiven({
            farmId,
            userId,
            amount: newAdvanceTransaction.amount,
            referenceId: newAdvanceTransaction.uuid,
            description: `Advance to ${employee.name}`,
            date: newAdvanceTransaction.transaction_date,
        });

        // Get employee's current advance balance
        const advanceBalance = await calculateEmployeeAdvanceBalance(farmId, employeeId);

        const responseData = {
            transaction: {
                transactionId: newAdvanceTransaction.uuid,
                employeeId: employee.uuid,
                employeeName: employee.name,
                amount: newAdvanceTransaction.amount,
                transactionDate: newAdvanceTransaction.transaction_date,
                paymentMethod: newAdvanceTransaction.payment_method,
                referenceNumber: newAdvanceTransaction.reference_number,
                deductFromSalary: newAdvanceTransaction.deduct_from_salary,
                deductionStartMonth: newAdvanceTransaction.deduction_start_month,
                monthlyDeductionAmount: newAdvanceTransaction.monthly_deduction_amount
            },
            employeeAdvanceBalance: {
                totalAdvancesGiven: advanceBalance.totalGiven,
                totalAdvancesReceived: advanceBalance.totalReceived,
                outstandingBalance: advanceBalance.outstanding
            }
        };

        return sendSuccessResponse(res, 201, true, "Advance given to employee successfully.", "advanceGiven", responseData);
    } catch (error) {
        next(error);
    }
};

// Helper function to calculate employee's advance balance
const calculateEmployeeAdvanceBalance = async (farmId, employeeId) => {
    const balanceResult = await AdvanceTransaction.findAll({
        where: {
            farmId,
            employee_id: employeeId,
            isDeleted: false
        },
        attributes: [
            'transaction_type',
            [sequelize.fn('SUM', sequelize.col('amount')), 'total']
        ],
        group: ['transaction_type'],
        raw: true
    });

    const totalGiven = balanceResult.find(item => item.transaction_type === 'given')?.total || 0;
    const totalReceived = balanceResult.find(item => item.transaction_type === 'received')?.total || 0;
    const outstanding = parseFloat(totalGiven) - parseFloat(totalReceived);

    return {
        totalGiven: parseFloat(totalGiven),
        totalReceived: parseFloat(totalReceived),
        outstanding: Math.max(0, outstanding) // Can't be negative
    };
};

export default giveAdvanceToEmployee;