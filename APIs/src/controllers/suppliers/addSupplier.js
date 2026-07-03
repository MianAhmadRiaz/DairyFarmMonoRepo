import Suppliers from "../../models/suppliers.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";

const AddSupplier = async (req, res, next) => {
    try {
        const { body: { name, contact, address }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        const checkSupplier = await Suppliers.findOne({ where: { name: name.toLowerCase(), farmId, isDeleted: false }, raw: true });
        if (checkSupplier) throw new ApiError("Invalid Details", 400, "Supplier with provided name already exist in your list.", true);
        const paylaod = {
            farmId,
            name: name.toLowerCase(),
            contact,
            address,
            createdBy: userId,
            updatedBy: userId,
        }
        const addSupplier = await Suppliers.create(paylaod);
        return sendSuccessResponse(res, 200, true, "Supplier add successfully.", "Suppliers", addSupplier);
    } catch (error) {
        next(error);
    }
    return AddSupplier;
};
export default AddSupplier;
