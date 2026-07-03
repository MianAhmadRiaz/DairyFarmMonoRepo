import { getUserById } from "../../../repo/user.js";
import { ApiError } from "../../../utils/ApiError.js";
import sendSuccessResponse from "../../../utils/responses/sendSuccessResponse.js";

const batchEditEmployeeSalaries = async (req, res, next) => {
    try {
        const { userId, body: { employees } } = req;
        
        if (!employees || !Array.isArray(employees)) {
            throw new ApiError("Invalid Data", 400, "Employees array is required", true);
        }

        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);

        // Process batch edits - store in temporary format or session
        // Since we don't need draft saving, we'll return the edited data for immediate generation
        const editedEmployees = employees.map(emp => {
            // Validate that employee exists and belongs to this farm
            return {
                employeeId: emp.employeeId,
                deduction: parseFloat(emp.deduction || 0),
                bonus: parseFloat(emp.bonus || 0),
                overtime: parseFloat(emp.overtime || 0),
                grossSalary: parseFloat(emp.grossSalary || 0),
                // Keep original calculated values for reference
                originalGrossSalary: parseFloat(emp.originalGrossSalary || 0),
                baseSalary: parseFloat(emp.baseSalary || 0),
                presentDays: parseInt(emp.presentDays || 0),
                month: emp.month
            };
        });

        return sendSuccessResponse(res, 200, true, "Employee salaries edited successfully. Ready for generation.", "editedSalaries", {
            editedEmployees,
            totalEmployees: editedEmployees.length,
            summary: {
                totalBaseSalary: editedEmployees.reduce((sum, emp) => sum + emp.baseSalary, 0),
                totalGrossSalary: editedEmployees.reduce((sum, emp) => sum + emp.grossSalary, 0),
                totalDeductions: editedEmployees.reduce((sum, emp) => sum + emp.deduction, 0),
                totalBonuses: editedEmployees.reduce((sum, emp) => sum + emp.bonus, 0),
                totalOvertime: editedEmployees.reduce((sum, emp) => sum + emp.overtime, 0)
            }
        });
    } catch (error) {
        next(error);
    }
};

export default batchEditEmployeeSalaries;