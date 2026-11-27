
const winston = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");
const path = require("path");
const fs = require("fs");

// Create logs folder
const logDirectory = path.join(__dirname, "../logs");

if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory, { recursive: true });
}

// Log format
const logFormat = winston.format.combine(
    winston.format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss"
    }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, stack }) => {
        return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
    })
);

// Create logger
const logger = winston.createLogger({

    level: process.env.LOG_LEVEL || "info",

    format: logFormat,

    transports: [

        // Error logs
        new DailyRotateFile({
            filename: path.join(logDirectory, "error-%DATE%.log"),
            datePattern: "YYYY-MM-DD",
            level: "error",
            maxSize: "10m",
            maxFiles: "14d"
        }),

        // Combined logs
        new DailyRotateFile({
            filename: path.join(logDirectory, "combined-%DATE%.log"),
            datePattern: "YYYY-MM-DD",
            maxSize: "10m",
            maxFiles: "14d"
        })
    ],

    // Uncaught exceptions
    exceptionHandlers: [
        new winston.transports.File({
            filename: path.join(logDirectory, "exceptions.log"),
            format: logFormat
        })
    ],

    // Unhandled promise rejections
    rejectionHandlers: [
        new winston.transports.File({
            filename: path.join(logDirectory, "rejections.log"),
            format: logFormat
        })
    ],

    // Do not terminate process automatically
    exitOnError: false
});

// Console logs in development
if (process.env.NODE_ENV !== "production") {

    logger.add(
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    );

}

module.exports = logger;
