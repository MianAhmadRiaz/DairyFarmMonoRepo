const EMAIL_REGEX = /^([\w-.]+@([\w-]+\.)+[\w-]{2,4})?$/;
const NAME_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿŠŽšžŸÇçßÐņĀāēūīō ]+[A-Za-zÀ-ÖØ-öø-ÿŠŽšžŸÇçßÐņĀāēūīō ]*$/; // /^[a-zA-Z '.-]*$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.,:;/\\(){}[\]_-])[ -~]{8,36}$/;
const NUMBER_REGEX = /^\+[0-9]+$/;

export {
    EMAIL_REGEX,
    NAME_REGEX,
    NUMBER_REGEX,
    PASSWORD_REGEX,
};
