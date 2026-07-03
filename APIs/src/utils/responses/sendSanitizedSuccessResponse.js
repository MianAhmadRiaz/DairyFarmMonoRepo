/* eslint-disable no-unused-vars */
function SEND_SANITIZED_SUCCESS_RESPONSE(user) {
    const { password, createdat, updatedat, ...rest } = user;
    return rest;
}
export default SEND_SANITIZED_SUCCESS_RESPONSE;
