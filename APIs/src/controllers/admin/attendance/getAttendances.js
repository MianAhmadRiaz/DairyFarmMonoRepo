import { getUserById } from "../../../repo/user.js";
import { ApiError } from "../../../utils/ApiError.js";
import sendSuccessResponse from "../../../utils/responses/sendSuccessResponse.js";
import sequelize from "../../../config/db.js";

async function getAttendance(req, res, next) {
    try {
        const { query: { startDate, endDate }, userId } = req;
        if (!startDate) throw new ApiError("Invalid Credentials", 400, "startDate is required", true);
        if (!endDate) throw new ApiError("Invalid Credentials", 400, "endDate is required", true);
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        const sql = `
            SELECT 
                a.uuid AS attendance_id,
                a.date,
                a.status,
                e.uuid AS employee_id,
                e.name AS employee_name,
                e.designation,
                e.department
            FROM attendance a
            LEFT JOIN employees e ON e.uuid = a.employee_id
            WHERE e."farmId" = :farmId
              AND a.date BETWEEN :startDate AND :endDate
            ORDER BY e.uuid, a.date ASC
        `;

        const results = await sequelize.query(sql, {
            replacements: { farmId, startDate, endDate },
            type: sequelize.QueryTypes.SELECT
        });

        // Group results by employee
        const groupedData = results.reduce((acc, row) => {
            if (!acc[row.employee_id]) {
                acc[row.employee_id] = {
                    employee_id: row.employee_id,
                    employee_name: row.employee_name,
                    designation: row.designation,
                    department: row.department,
                    attendance: []
                };
            }
            acc[row.employee_id].attendance.push({
                attendance_id: row.attendance_id,
                date: row.date,
                status: row.status
            });
            return acc;
        }, {});

        const responseData = {
            attendance: Object.values(groupedData),
        };
        return sendSuccessResponse(res, 201, true, "Attendance data add successfully", "attendance", responseData);
    } catch (error) {
        next(error);
    }
    return false;
}

export default getAttendance;
