import BaseError from "./BaseError.js";
import logger from "../logger/index.js";
import fatalLogger from "../logger/fatal.js";

class ErrorHandler {
    handleError(err) {
        logger.error(
            `Error: ${err.message}`,
            err,
        );
    }

    handleUncaughtException(error) {
        fatalLogger.fatal(
            `Uncaught Exception: ${error}`,
            error,
        );

    }

    isTrustedError(error) {
        if (error instanceof BaseError) {
            return error.isOperational;
        }
        return false;
    }
}

const errorHandler = new ErrorHandler();

export default errorHandler;
