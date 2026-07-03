/* eslint-disable no-undef */
import jwt from "jsonwebtoken";
import ENV from "../config/keys.js";

function validateToken(token) {
    // Token expiry is enforced in every environment — a leaked dev token must
    // not live forever.
    const ignoreExpiration = false;
    try {
        if (!token) {
            return {
                token: false,
                message: "Access denied. No token provided.",
            };
        }

        const bearer = token.split(" ");

        const [, bearerToken] = bearer;

        const decoded = jwt.verify(bearerToken, ENV.JWT.SECRET, { ignoreExpiration });
        if (!decoded.userId) {
            return {
                token: false,
                message: "Access denied. Token is malformed",
            };
        }
        return {
            token: true,
            user: decoded,
        };
    } catch (error) {
        return {
            token: false,
            message: error.message,
        };
    }
}

export default validateToken;
