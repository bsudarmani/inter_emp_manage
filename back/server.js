require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const connectDB = require("./config/db");
const logger=require('./config/logger')
const requestLogger=require("./middleware/requestLogger");

const { generalLimiter } = require("./middleware/rateLimiters");

const app = express();

//middlewares
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

//winston HTTP logger
app.use(requestLogger);

// Apply general rate limit to API routes
app.use("/api", generalLimiter);

app.get("/", (req, res) => {
    res.send("Task Management API Running");
});

app.use("/api/users", require("./routes/authRoutes"));
app.use("/api/tasks", require("./routes/tasksRoutes"));

//error handing middleware
app.use((err, req, res, next) => {

    logger.error(
        `${req.method} ${req.originalUrl} - ${err.message}`,
        { stack: err.stack }
    );

    res.status(err.status || 500).json({
        message: "Internal Server Error"
    });
});

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await connectDB();
         
        logger.info("MongoDB Connected Successfully");

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (error) {
        logger.error("Server startup failed",{
            stack:error.stack
        });
        console.error("Server startup error:", error.message);
        process.exit(1);
    }
};

startServer();