import jwt from "jsonwebtoken";
import ENV from "../config/keys.js";
 
function signJwtToken(payload, expiresIn = "7d", secret = ENV.JWT.SECRET) {
    return jwt.sign(payload, secret, {
        expiresIn,
    });
}
export default signJwtToken;