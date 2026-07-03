class BaseError extends Error {
    static name;
    static httpCode;
    static isOperational;
    static description;
    static errorId;
    static values;

    constructor(name, httpCode, description, isOperational, errorId, values) {
        super(description);
        Object.setPrototypeOf(this, new.target.prototype);

        this.name = name;
        this.httpCode = httpCode;
        this.isOperational = isOperational;
        this.description = description;
        this.errorId = errorId;
        this.values = values;

        Error.captureStackTrace(this);
    }
}

export default BaseError;
