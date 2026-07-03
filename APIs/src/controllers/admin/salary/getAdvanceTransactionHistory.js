import { Op } from "sequelize";
import sequelize from "../../../config/db.js";
import { getUserById } from "../../../repo/user.js";
import { ApiError } from "../../../utils/ApiError.js";
import sendSuccessResponse from "../../../utils/responses/sendSuccessResponse.js";
import Employee from "../../../models/employee.js";
import AdvanceTransaction from "../../../models/advanceTransaction.js";

const getAdvanceTransactionHistory = async (req, res, next) => {
    try {
        const { userId, query: { 
            limit = 10, 
            page = 1, 
            employeeId,
            transaction_type, // 'given', 'received', or 'all'
            start_date,
            end_date,
            payment_method,
            status = 'all'
        } } = req;

        const offset = (page - 1) * limit;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);

        // Build where conditions
        const whereConditions = {
            farmId,
            isDeleted: false
        };

        if (employeeId) {
            whereConditions.employee_id = employeeId;
        }

        if (transaction_type && transaction_type !== 'all') {
            whereConditions.transaction_type = transaction_type;
        }

        if (payment_method) {
            whereConditions.payment_method = payment_method;
        }

        if (status && status !== 'all') {
            whereConditions.status = status;
        }

        if (start_date || end_date) {
            whereConditions.transaction_date = {};
            if (start_date) {
                whereConditions.transaction_date[Op.gte] = new Date(start_date);
            }
            if (end_date) {
                whereConditions.transaction_date[Op.lte] = new Date(end_date);
            }
        }

        // Get transactions with employee details
        const { count, rows: transactions } = await AdvanceTransaction.findAndCountAll({
            where: whereConditions,
            include: [
                {
                    model: Employee,
                    as: 'employee',
                    attributes: ['uuid', 'name', 'designation', 'department']
                }
            ],
            offset,
            limit,
            order: [['transaction_date', 'DESC'], ['createdAt', 'DESC']],
            raw: false
        });

        // Calculate summary statistics
        const summaryStats = await AdvanceTransaction.findAll({
            where: whereConditions,
            attributes: [
                'transaction_type',
                [sequelize.fn('COUNT', sequelize.col('uuid')), 'transaction_count'],
                [sequelize.fn('SUM', sequelize.col('amount')), 'total_amount']
            ],
            group: ['transaction_type'],
            raw: true
        });

        const totalGiven = summaryStats.find(stat => stat.transaction_type === 'given');
        const totalReceived = summaryStats.find(stat => stat.transaction_type === 'received');

        const summary = {
            totalAdvancesGiven: {
                count: parseInt(totalGiven?.transaction_count || 0),
                amount: parseFloat(totalGiven?.total_amount || 0)
            },
            totalAdvancesReceived: {
                count: parseInt(totalReceived?.transaction_count || 0),
                amount: parseFloat(totalReceived?.total_amount || 0)
            },
            netOutstanding: parseFloat(totalGiven?.total_amount || 0) - parseFloat(totalReceived?.total_amount || 0)
        };

        // Format transaction data
        const formattedTransactions = transactions.map(transaction => ({
            transactionId: transaction.uuid,
            employeeId: transaction.employee_id,
            employeeName: transaction.employee.name,
            employeeDesignation: transaction.employee.designation,
            employeeDepartment: transaction.employee.department,
            transactionType: transaction.transaction_type,
            amount: parseFloat(transaction.amount),
            transactionDate: transaction.transaction_date,
            paymentMethod: transaction.payment_method,
            referenceNumber: transaction.reference_number,
            description: transaction.description,
            deductFromSalary: transaction.deduct_from_salary,
            deductionStartMonth: transaction.deduction_start_month,
            monthlyDeductionAmount: parseFloat(transaction.monthly_deduction_amount || 0),
            status: transaction.status,
            financialYear: transaction.financial_year,
            createdAt: transaction.createdAt
        }));

        const totalPages = Math.ceil(count / limit);

        const responseData = {
            transactions: formattedTransactions,
            summary,
            pagination: {
                page: Number(page),
                totalPages: Number(totalPages),
                limit: Number(limit),
                skip: offset,
                totalCount: Number(count)
            },
            filters: {
                employeeId: employeeId || null,
                transactionType: transaction_type || 'all',
                startDate: start_date || null,
                endDate: end_date || null,
                paymentMethod: payment_method || null,
                status: status || 'all'
            }
        };

        return sendSuccessResponse(res, 200, true, "Advance transaction history fetched successfully.", "advanceHistory", responseData);
    } catch (error) {
        next(error);
    }
};

export default getAdvanceTransactionHistory;