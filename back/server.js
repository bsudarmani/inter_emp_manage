require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const connectDB = require("./config/db");

const {
    generalLimiter
} = require("./middleware/rateLimiters");

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Apply general rate limit to API routes
app.use("/api", generalLimiter);

app.get("/", (req, res) => {
    res.send("Task Management API Running");
});

app.use("/api/users", require("./routes/authRoutes"));
app.use("/api/tasks", require("./routes/tasksRoutes"));

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (error) {
        console.error("Server startup error:", error.message);
        process.exit(1);
    }
};

startServer();