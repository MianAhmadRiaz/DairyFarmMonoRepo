import { getUserById } from "../../../repo/user.js";
import { ApiError } from "../../../utils/ApiError.js";
import sendSuccessResponse from "../../../utils/responses/sendSuccessResponse.js";
import Employee from "../../../models/employee.js";
import isValidUUID from "../../../utils/uuidValidator.js";
import Attendance from "../../../models/attendance.js";

async function markAttendance(req, res, next) {
    try {
        const { date, data } = req.body;
        const { userId } = req;

        if (!date) {
            throw new ApiError("Invalid Credentials", 400, "date is required", true);
        }
        if (!Array.isArray(data) || data.length === 0) {
            throw new ApiError("Invalid Credentials", 400, "data must be a non-empty array of {userId, status}.", true);
        }

        const user = await getUserById(userId);
        if (!user || !user.farmId) {
            throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        }

        const { farmId } = user;

        // Filter valid entries first
        const validEntries = data.filter(
            ({ userId: empId, status }) =>
                isValidUUID(empId) &&
                ["absent", "present", "leave"].includes(status?.toLowerCase())
        );

        if (!validEntries.length) {
            return sendSuccessResponse(res, 200, true, "No valid attendance entries found", "attendance");
        }

        // Get all employee UUIDs in one query
        const employeeIds = validEntries.map(e => e.userId);
        const existingEmployees = await Employee.findAll({
            where: { uuid: employeeIds, farmId, isDeleted: false },
            attributes: ["uuid"],
            raw: true
        });

        const validEmployeeSet = new Set(existingEmployees.map(e => e.uuid));

        // Re-marking a day must UPDATE the existing row, not insert a duplicate
        // (duplicates inflate present/absent counts used by payroll).
        const existingRows = await Attendance.findAll({
            where: { farmId, date, employee_id: [...validEmployeeSet] },
            attributes: ["uuid", "employee_id"],
            raw: true,
        });
        const existingByEmployee = new Map(existingRows.map(r => [r.employee_id, r.uuid]));

        const toInsert = [];
        const toUpdate = [];
        validEntries
            .filter(e => validEmployeeSet.has(e.userId))
            .forEach(e => {
                const status = e.status.toLowerCase();
                if (existingByEmployee.has(e.userId)) {
                    toUpdate.push({ uuid: existingByEmployee.get(e.userId), status });
                } else {
                    toInsert.push({ employee_id: e.userId, farmId, date, status });
                }
            });

        if (toInsert.length) {
            await Attendance.bulkCreate(toInsert);
        }
        for (const row of toUpdate) {
            await Attendance.update({ status: row.status }, { where: { uuid: row.uuid, farmId } });
        }

        return sendSuccessResponse(res, 201, true, "Attendance data added successfully", "attendance");
    } catch (error) {
        next(error);
    }
}

export default markAttendance;
