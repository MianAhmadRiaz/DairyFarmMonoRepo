import print from "../utils/print.js";
import ENV from "./keys.js";
import { Sequelize } from "sequelize";

// Debug environment variables
console.log('ENV.DATABASE:', ENV.DATABASE);

const sequelize = new Sequelize(ENV.DATABASE.DATABASE_NAME, ENV.DATABASE.USER_NAME, ENV.DATABASE.USER_PASSWORD, {
    host: ENV.DATABASE.HOST,
    dialect: ENV.DATABASE.DIALECT || 'postgres', // Fallback to postgres
    logging: false,
});
try {
    await sequelize.authenticate();
    print("info", "Connection has been established successfully.");
} catch (error) {
    console.error("Unable to connect to the database:", error);
}

export default sequelize;
