import bcrypt from "bcrypt";
import Role from "../../../models/role.js";
import User from "../../../models/user.js";
import { getUserById } from "../../../repo/user.js";
import { ApiError } from "../../../utils/ApiError.js";
import generateTempPassword from "../../../utils/generateTempPassword.js";
import sendSuccessResponse from "../../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../../utils/uuidValidator.js";
import FarmConfiguration from "../../../models/farmConfiguration.js";
import Event from "../../eventEmiiter/events.js";
import { EventTypes } from "../../../constants/index.js";

// The farm Owner creates a user with a role. A temporary password is
// auto-generated and returned ONCE for the Owner to hand over; the new user
// must reset it on first login.
async function createUser(req, res, next) {
    try {
        const { body: { email, phoneNumber, firstname, lastname, roleId }, userId } = req;

        if (!email) throw new ApiError("Invalid Credentials", 400, "Email is required", true);
        if (!firstname || !lastname) throw new ApiError("Invalid Credentials", 400, "firstName and lastName is required", true);
        if (!isValidUUID(roleId)) throw new ApiError("Invalid Credentials", 400, "RoleId is required", true);
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        const config = await FarmConfiguration.findOne({ where: { farmId }, raw: true });
        if (!config) throw new ApiError("Unauthorized", 400, "Farm configuration not found.", true);
        const { allowed_employees, current_employees } = config;
        if (current_employees >= allowed_employees) throw new ApiError("Unauthorized", 400, "You have reach the maximum allowed employees limit.", true);
        const userExists = await User.findOne({ where: { email: email.toLowerCase(), isDeleted: false } });
        if (userExists) throw new ApiError("Invalid Details", 400, "User already exist", true);
        const isRole = await Role.findOne({ where: { uuid: roleId, farmId, isDeleted: false }, raw: true });
        if (!isRole) throw new ApiError("Invalid Details", 400, "Role not found.", true);
        // The Owner role is the account owner and cannot be assigned to new users.
        if (isRole.isOwner) throw new ApiError("Invalid Details", 400, "The Owner role cannot be assigned to additional users.", true);

        const tempPassword = generateTempPassword(12);
        const hashedPassword = await bcrypt.hash(tempPassword, 10);
        const newUser = await User.create({
            createdBy: user.uuid,
            firstname: firstname.toLowerCase(),
            lastname: lastname.toLowerCase(),
            email: email.toLowerCase(),
            password: hashedPassword,
            phoneNumber,
            roleId,
            farmId,
            role_name: isRole.name,
            must_reset_password: true,
        });
        if (!newUser) throw new ApiError("Db Error", 400, "User not created", true);
        await FarmConfiguration.increment({ current_employees: 1 }, { where: { farmId } });
        Event.emit(EventTypes.Logs, {
            farmId,
            message: `${user.email} has added a new user with email: ${email} to the farm.`,
        });
        return sendSuccessResponse(res, 201, true, "User created successfully. Share the temporary password — the user must reset it on first login.", "user", {
            user: { uuid: newUser.uuid, email: newUser.email, firstname: newUser.firstname, lastname: newUser.lastname, role_name: isRole.name },
            tempPassword,
        });
    } catch (error) {
        next(error);
    }
}

export default createUser;
