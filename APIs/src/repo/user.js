import Admin from "../models/softwareAdmin.js";
import User from "../models/user.js";

async function getUserById(uuid, isSoftwareAdmin = false) {
    try {
        let user;
         if (!isSoftwareAdmin) user = await User.findOne({ where: { uuid }, raw: true });
         else user = await Admin.findOne({ where: { uuid }, raw: true });
        return user;
    } catch (err) {
        throw new Error(err)
    }
}

export {
    getUserById,
};
