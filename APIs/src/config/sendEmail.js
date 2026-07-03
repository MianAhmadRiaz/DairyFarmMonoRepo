import nodemailer from "nodemailer";
import { SmtpServerCredentials } from "../constants/index.js";
import KEYS from "./keys.js";
import logger from "../logger/index.js";

async function sendEmail(email, subject, html, fileData, fileName) {
  try {
    let transporter = nodemailer.createTransport(SmtpServerCredentials);
    let info = {
      from: KEYS.SMTP.USER,
      to: email,
      subject,
      text: "Dairy Form",
      html,
    };
    if (fileData) {
      info.attachments = [
        {
          filename: fileName,
          content: fileData,
          contentType: 'text/csv'
        }
      ];
    }
    await transporter.sendMail(info);
    logger.info("Email send successfully ");
  } catch (err) {
    logger.error("Error occurred while sending email:", err);
    throw new Error(err.message);
  }
}

export default sendEmail;
