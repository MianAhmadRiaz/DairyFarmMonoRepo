const validateInputs = (joiSchema, dataToValidate) => {
    const { error } = joiSchema.validate(dataToValidate);
    const extraFields = [];
    const errorMessage = error?.details?.map((err) => {
    if (err.type === "object.unknown") {
        extraFields.push(err.context.key);
    } else return err.message;
});
if (extraFields.length > 0) errorMessage.push(`extra_fields ${extraFields}`);
    if (errorMessage) {
        return {
            error: true,
            errorMessage: errorMessage.join(", "),
        };
    }

    return false;
};

export default validateInputs;
