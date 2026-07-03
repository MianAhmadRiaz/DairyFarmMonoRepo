import dotenv from "dotenv";
import speakeasy from "speakeasy";
import QRCode from "qrcode";

dotenv.config();
function generateSecretkey(name) {
    // Generate a secret key
    const secretKey = speakeasy.generateSecret({ length: 20, name });

    return secretKey;
}
// verify-otp
function verifyAuthenticatorOTP(secret, otp) {
    const verified = speakeasy.totp.verify({
        secret,
        encoding: "base32",
        token: otp,
    });
    return verified;
}
// generate QR-Code for user
async function generateQRCodeURL(secret, label, issuer) {
    try {
        const otpAuthURL = speakeasy.otpauthURL({
            secret: secret.base32,
            label,
            issuer,
        });
    const newsecret = otpAuthURL.split("=")[1].split("&")[0];
        const dataURL = await QRCode.toDataURL(otpAuthURL);
        const data = {
            Url: dataURL,
            secret: newsecret,
        };
        return data;
    } catch (err) {
        throw new Error(err);
    }
}
export {
    generateSecretkey,
    verifyAuthenticatorOTP,
    generateQRCodeURL,
};
