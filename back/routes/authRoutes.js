const express = require("express");

const router = express.Router();

const {
    registerUser,
    loginUser,
    refreshAccessToken,
    logout, getProfile,
    getAllUsers,
    resetPassword,forgotPassword
} = require("../controller/authController");

const {
    authLimiter,
    refreshLimiter
} = require("../middleware/rateLimiters");

const authorizeRoles = require("../middleware/roleMiddleware");

const authMiddleware = require("../middleware/authMiddleware");


const passwordResetLimiter=require("../middleware/passwordResetLimiter")

// Register
router.post("/register", authLimiter, registerUser);

// Login
router.post("/login", authLimiter, loginUser);

// Refresh Access Token
router.post("/refresh", refreshLimiter, refreshAccessToken);

// Logout
router.post("/logout", logout);

// Protected Profile
router.get("/profile", authMiddleware, getProfile);

// Forgot password
// router.post("/forgot-password", forgotPassword);

// // Reset password
// router.post("/reset-password", resetPassword);

router.post(
    "/forgot-password",
    passwordResetLimiter,
    forgotPassword
);

router.post(
    "/reset-password",
    passwordResetLimiter,
    resetPassword
);

//admin only
router.get(
    "/",
    authMiddleware,
    authorizeRoles("admin"),
    getAllUsers
);

module.exports = router;