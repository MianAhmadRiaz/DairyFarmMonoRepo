import sequelize from "../../../config/db.js";
import { getUserById } from "../../../repo/user.js";
import { ApiError } from "../../../utils/ApiError.js";
import sendSuccessResponse from "../../../utils/responses/sendSuccessResponse.js";
import Employee from "../../../models/employee.js";
import AdvanceTransaction from "../../../models/advanceTransaction.js";
import { recordAdvanceReceived } from "../../../utils/finance/financeHooks.js";

const receiveAdvanceFromEmployee = async (req, res, next) => {
    try {
        const { userId, body: { 
            employeeId, 
            amount, 
            transaction_date,
            payment_method = 'cash',
            reference_number,
            description
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

        // Check if employee has outstanding advance balance
        const currentBalance = await calculateEmployeeAdvanceBalance(farmId, employeeId);
        const receivedAmount = parseFloat(amount);

        if (receivedAmount > currentBalance.outstanding) {
            throw new ApiError("Invalid Data", 400, 
                `Payment amount (${receivedAmount}) exceeds outstanding advance balance (${currentBalance.outstanding})`, true);
        }

        // Calculate financial year
        const transactionDate = transaction_date ? new Date(transaction_date) : new Date();
        const year = transactionDate.getFullYear();
        const month = transactionDate.getMonth();
        const financialYear = month >= 3 ? `${year}-${year + 1}` : `${year - 1}-${year}`;

        // Create advance received transaction record
        const advanceData = {
            farmId,
            employee_id: employeeId,
            transaction_type: 'received',
            amount: receivedAmount,
            transaction_date: transactionDate,
            reference_number,
            payment_method,
            description: description || `Advance payment received from ${employee.name}`,
            deduct_from_salary: false, // Not applicable for received payments
            status: 'active',
            expense_category: 'Advance Recovery',
            financial_year: financialYear,
            createdBy: user.uuid,
            updatedBy: user.uuid
        };

        const newAdvanceTransaction = await AdvanceTransaction.create(advanceData);

        // Finance automation: record the advance repayment back into cash (non-blocking)
        await recordAdvanceReceived({
            farmId,
            userId,
            amount: newAdvanceTransaction.amount,
            referenceId: newAdvanceTransaction.uuid,
            description: `Advance recovery from ${employee.name}`,
            date: newAdvanceTransaction.transaction_date,
        });

        // Get updated balance after this payment
        const updatedBalance = await calculateEmployeeAdvanceBalance(farmId, employeeId);

        // Check if advance is now fully recovered
        if (updatedBalance.outstanding === 0) {
            // Update all active 'given' transactions for this employee to 'fully_recovered'
            await AdvanceTransaction.update(
                { status: 'fully_recovered', updatedBy: user.uuid },
                {
                    where: {
                        farmId,
                        employee_id: employeeId,
                        transaction_type: 'given',
                        status: 'active',
                        isDeleted: false
                    }
                }
            );
        }

        const responseData = {
            transaction: {
                transactionId: newAdvanceTransaction.uuid,
                employeeId: employee.uuid,
                employeeName: employee.name,
                amount: newAdvanceTransaction.amount,
                transactionDate: newAdvanceTransaction.transaction_date,
                paymentMethod: newAdvanceTransaction.payment_method,
                referenceNumber: newAdvanceTransaction.reference_number
            },
            employeeAdvanceBalance: {
                totalAdvancesGiven: updatedBalance.totalGiven,
                totalAdvancesReceived: updatedBalance.totalReceived,
                outstandingBalance: updatedBalance.outstanding,
                isFullyRecovered: updatedBalance.outstanding === 0
            },
            previousBalance: currentBalance.outstanding,
            amountReceived: receivedAmount,
            newBalance: updatedBalance.outstanding
        };

        return sendSuccessResponse(res, 201, true, "Advance payment received from employee successfully.", "advanceReceived", responseData);
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
        outstanding: Math.max(0, outstanding)
    };
};

export default receiveAdvanceFromEmployee;