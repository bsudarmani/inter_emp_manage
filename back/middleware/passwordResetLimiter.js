const rateLimit = require("express-rate-limit");

const passwordResetLimiter = rateLimit({
    windowMs: 24 * 60* 60 * 1000,
    max: 2,

    message: {
        message: "Too many requests. Please try again later."
    },

    standardHeaders: true,
    legacyHeaders: false
});

module.exports = passwordResetLimiter;