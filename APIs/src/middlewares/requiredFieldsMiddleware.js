import { ApiError } from "../utils/ApiError.js";
import validateInputs from "../utils/validateInputs.js";

const requiredFieldsMiddleware = (schema, isQuery = false) => {
    const Handler = (req, res, next) => {
        // get bearer token from header
        try {
            let data = req.body;
            if (isQuery) data = req.query;
            const isError = validateInputs(schema, data); // returns an object with all the errors
            if (isError) throw new ApiError("Validation error", 400, isError.errorMessage, true);

            next();
        } catch (error) {
            next(error);
        }
    };
    return Handler;
};

export default requiredFieldsMiddleware;
