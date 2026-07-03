import bcrypt from "bcrypt";
import { getUserById } from "../../../repo/user.js";
import { ApiError } from "../../../utils/ApiError.js";
import sendSuccessResponse from "../../../utils/responses/sendSuccessResponse.js";
import Admin from "../../../models/softwareAdmin.js";
import isValidUUID from "../../../utils/uuidValidator.js";
import AdminRoles from "../../../models/systemAdminRoles.js";

async function createUser(req, res, next) {
    try {
        const { body: { email, password, phoneNumber, firstname, lastname, confirmpassword, roleId }, userId } = req;

        if (!email) throw new ApiError("Invalid Credentials", 400, "Email is required", true);
        if (!password) throw new ApiError("Invalid Credentials", 400, "Password is required", true);
        if (!confirmpassword) throw new ApiError("Invalid Credentials", 400, "ConfirmPassword is required", true);
        if (!firstname || !lastname) throw new ApiError("Invalid Credentials", 400, "firstName and lastName is required", true);
        if (!isValidUUID(roleId)) throw new ApiError("Invalid Credentials", 400, "RoleId is required", true);
        const user = await getUserById(userId, true);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const userExists = await Admin.findOne({ where: { email, isDeleted: false } });
        if (userExists) throw new ApiError("Invalid Details", 400, "User with provided email already exist", true);
        const isRole = await AdminRoles.findOne({ where: { uuid: roleId, isDeleted: false }, raw: true });
        if (!isRole) {
            throw new ApiError("Invalid Details", 400, "Role not found.", true);
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const userData = {
            firstname: firstname.toLowerCase(),
            lastname: lastname.toLowerCase(),
            email: email.toLowerCase(),
            password: hashedPassword,
            phoneNumber,
            roleId,
            role_name: isRole.name,
        };
        const newUser = await Admin.create(userData);
        if (!newUser) throw new ApiError("Db Error", 400, "User not created", true);
        return sendSuccessResponse(res, 201, true, "user created successfully", "admin");
    } catch (error) {
        next(error);
    }
    return false;
}

export default createUser;
