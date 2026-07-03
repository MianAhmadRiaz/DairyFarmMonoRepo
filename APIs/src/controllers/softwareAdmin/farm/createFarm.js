import bcrypt from "bcrypt";
import sequelize from "../../../config/db.js";
import { EventTypes } from "../../../constants/index.js";
import Farms from "../../../models/farm.js";
import User from "../../../models/user.js";
import FinalMilk from "../../../models/finalMilk.js";
import { getUserById } from "../../../repo/user.js";
import { ApiError } from "../../../utils/ApiError.js";
import { recordAuditLog } from "../../../utils/audit/recordAuditLog.js";
import generateTempPassword from "../../../utils/generateTempPassword.js";
import sendSuccessResponse from "../../../utils/responses/sendSuccessResponse.js";
import Event from "../../eventEmiiter/events.js";

const adminName = (a) => [a?.firstname, a?.lastname].filter(Boolean).join(" ").trim() || null;

// Super-admin provisions a new farm and its Owner user. Replaces public signup.
// A temporary password is auto-generated and returned ONCE for the admin to
// hand over; the owner must reset it on first login.
export const createFarm = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
        const { userId, body } = req;
        const admin = await getUserById(userId, true);
        if (!admin) throw new ApiError("Unauthorized", 401, "Unauthorized access.", true);

        const { farmName, ownerFirstname, ownerLastname, ownerEmail, ownerPhone, location, time_zone } = body || {};
        if (!farmName || !farmName.trim()) throw new ApiError("Invalid Details", 400, "farmName is required.", true);
        if (!ownerFirstname || !ownerLastname) throw new ApiError("Invalid Details", 400, "Owner first and last name are required.", true);
        if (!ownerEmail || !ownerEmail.trim()) throw new ApiError("Invalid Details", 400, "Owner email is required.", true);

        const email = ownerEmail.toLowerCase().trim();
        const emailExists = await User.findOne({ where: { email }, raw: true, transaction });
        if (emailExists) throw new ApiError("Invalid Details", 400, "A user with this email already exists.", true);

        // Farm is created APPROVED + active since the super admin is provisioning it.
        const farm = await Farms.create({
            name: farmName.trim().toLowerCase(),
            status: "APPROVED",
            is_active: true,
            location: location || null,
            time_zone: time_zone || null,
        }, { transaction });

        const tempPassword = generateTempPassword(12);
        const hashed = await bcrypt.hash(tempPassword, 10);
        const owner = await User.create({
            firstname: ownerFirstname.toLowerCase(),
            lastname: ownerLastname.toLowerCase(),
            email,
            phoneNumber: ownerPhone || null,
            password: hashed,
            farmId: farm.uuid,
            must_reset_password: true,
        }, { transaction });

        await FinalMilk.create({ farmId: farm.uuid }, { transaction });
        await transaction.commit();

        // Provision roles (Owner + dairy roles), farm config and default stock
        // categories via the existing events (they run outside the transaction).
        Event.emit(EventTypes.UpdateUserRole, { userId: owner.uuid, farmId: farm.uuid });
        Event.emit(EventTypes.AddDefaultCategories, { userId: owner.uuid, farmId: farm.uuid });

        await recordAuditLog({
            req, adminName: adminName(admin), action: "farm.create",
            entityType: "farm", entityId: farm.uuid,
            description: `Created farm "${farm.name}" with owner ${email}`,
        });

        return sendSuccessResponse(res, 201, true, "Farm created successfully. Share the temporary password with the owner — they must reset it on first login.", "farm", {
            farm: { uuid: farm.uuid, name: farm.name, location: farm.location, time_zone: farm.time_zone },
            owner: { uuid: owner.uuid, email, firstname: owner.firstname, lastname: owner.lastname },
            tempPassword,
        });
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};

export default createFarm;
