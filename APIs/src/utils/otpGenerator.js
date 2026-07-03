import crypto from "crypto";

// 6-digit cryptographically random one-time code.
const otpGenerator = () => crypto.randomInt(100000, 1000000);
export default otpGenerator;
