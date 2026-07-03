import Suppliers from "../../models/suppliers.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../utils/uuidValidator.js";

const DeleteSupplier = async (req, res, next) => {
    try {
        const { query: { supplierId }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        if (!isValidUUID(supplierId)) throw new ApiError("Invalid Details", 400, "Please provide a valid supplierId.", true);
        const checkSupplier = await Suppliers.findOne({ where: { uuid: supplierId, farmId, isDeleted: false }, raw: true });
        if (!checkSupplier) throw new ApiError("Invalid Details", 400, "Supplier not found with provided supplierId", true);
        await Suppliers.update({ isDeleted: true }, { where: { uuid: supplierId, farmId } });
        return sendSuccessResponse(res, 200, true, "Supplier remove successfully.", "Supplier");
    } catch (error) {
        next(error);
    }
    return DeleteSupplier;
};
export default DeleteSupplier;
