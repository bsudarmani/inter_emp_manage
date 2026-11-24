const rateLimit = require("express-rate-limit");

// General API limit
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 200,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        message: "Too many requests. Please try again later."
    }
});

// Register and Login limit
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        message: "Too many login/register attempts. Try again after 15 minutes."
    }
});

// Refresh Token limit
const refreshLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        message: "Too many refresh requests. Please try again later."
    }
});

module.exports = {
    generalLimiter,
    authLimiter,
    refreshLimiter
};