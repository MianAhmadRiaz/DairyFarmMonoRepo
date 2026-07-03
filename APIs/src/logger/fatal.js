import winston from "winston";
import { customLevels } from "../constants/index.js";

const formatter = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.splat(),
    winston.format.printf((info) => {
        const { timestamp, level, message, ...meta } = info;

        return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ""
            }`;
    }),
);

const isDevEnvironment = () => false;
class FatalLogger {
    // private logger: winston.Logger;
    static logger;

    constructor() {
        const prodTransport = new winston.transports.File({
            filename: "logs/fatal.log",
            level: "error",
        });
        const transport = new winston.transports.Console({
            format: formatter,
        });
        this.logger = winston.createLogger({
            level: isDevEnvironment() ? "trace" : "error",
            levels: customLevels.levels,
            transports: [isDevEnvironment() ? transport : prodTransport],
        });
        winston.addColors(customLevels.colors);
    }

    fatal(msg, meta) {
        this.logger.log("fatal", msg, meta);
    }
}

const fatalLogger = new FatalLogger();

export default fatalLogger;
