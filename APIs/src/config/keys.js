/* eslint-disable no-undef */
import dotenv from "dotenv";

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

export default {
    PORT: process.env.PORT,
    JWT: {
        SECRET: process.env.JWT_SECRET,
        TOKEN_EXPIRY: process.env.JWT_TOKEN_EXPIRY || "30d",
    },    DATABASE: {
        HOST: process.env.SQL_HOST,
        USER_NAME: process.env.SQL_USER_NAME,
        USER_PASSWORD: process.env.SQL_USER_PASSWORD,
        DATABASE_NAME: process.env.DATABASE_NAME,
        PORT: process.env.SQL_PORT,
        DIALECT: process.env.DIALECT
    },
    SMTP: {
        HOST: process.env.SMTP_HOST,
        PORT: process.env.SMTP_PORT,
        PASSWORD: process.env.SMTP_PASSWORD,
        USER: process.env.SMTP_USER,
    },
    // Bootstrap software-admin account, created by the seeder if it doesn't exist.
    SUPER_ADMIN: {
        EMAIL: process.env.SUPER_ADMIN_EMAIL || "superadmin@cattlecare.app",
        PASSWORD: process.env.SUPER_ADMIN_PASSWORD || "ChangeMe@12345",
        FIRSTNAME: process.env.SUPER_ADMIN_FIRSTNAME || "Super",
        LASTNAME: process.env.SUPER_ADMIN_LASTNAME || "Admin",
    },
};
