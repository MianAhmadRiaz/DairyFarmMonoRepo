import otpGenerator from "./../utils/otpGenerator.js";
import addMinutesToCurrentDate from "./../utils/addTenMinutesToCurrentDate.js";
import User from "../models/user.js";
import sendEmail from "../config/sendEmail.js";
import logger from "../logger/index.js";

// Generates a one-time code, persists it on the user, and emails it.
// The reset flow verifies otp + otptype + otpexpiry in resetPassword.
const sendEmailWithOtp = async ({ email, subject = "CattleCare password reset", otptype, resendOtp = true }) => {
    const otp = otpGenerator();
    const otpexpiry = addMinutesToCurrentDate(10);
    await User.update(
        { otp: String(otp), otptype, otpexpiry },
        { where: { email: email.toLowerCase(), isDeleted: false } }
    );
    await sendEmail(
        email,
        subject,
        `<div style="font-family:Arial,sans-serif">
            <h2>CattleCare</h2>
            <p>Your one-time code is:</p>
            <h1 style="letter-spacing:4px">${otp}</h1>
            <p>This code expires in 10 minutes. If you did not request it, ignore this email.</p>
        </div>`
    );
    logger.info(`OTP email sent to ${email} (type: ${otptype})`);
    return {
        success: true,
        message: "Email send successfully",
    };
};

export default sendEmailWithOtp;
