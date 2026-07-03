import ProtocolInfo from "../../models/protocolsInfo.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../utils/uuidValidator.js";

const GetProtocols = async (req, res, next) => {
    try {
        const { query: { limit = 20, page = 1, protocolId }, userId } = req;
        const offset = (page - 1) * limit;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        if (isValidUUID(protocolId)) {
            const protocol = await ProtocolInfo.findOne({ where: { uuid: protocolId, farmId, isDeleted: false }, raw: true });
            if (!protocol) throw new ApiError("Invalid Details", 400, "protocol not found with provided protocolId", true);
            return sendSuccessResponse(res, 200, true, "Protocol fetched successfully.", "protocol", protocol);
        }
        const where = { isDeleted: false, farmId };
        const { count, rows: protocols } = await ProtocolInfo.findAndCountAll({
            where,
            offset,
            limit,
            order: [["createdAt", "DESC"]],
        });

        const totalPages = Math.ceil(count / limit);
        const responseData = {
            protocols,
            page: Number(page),
            totalPages: Number(totalPages),
            limit: Number(limit),
            skip: offset,
            totalCount: Number(count),
        };
        return sendSuccessResponse(res, 200, true, "Protocol fetched successfully.", "protocol", responseData);
    } catch (error) {
        next(error);
    }
    return GetProtocols;
};
export default GetProtocols;
