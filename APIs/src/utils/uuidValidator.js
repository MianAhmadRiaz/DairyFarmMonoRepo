import validator from "validator";

const isValidUUID = (uuid = "") => {
    return validator.isUUID(uuid);
};

export default isValidUUID;
