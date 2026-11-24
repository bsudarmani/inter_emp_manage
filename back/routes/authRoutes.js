const express = require("express");

const router = express.Router();

const {
    registerUser,
    loginUser,
    refreshAccessToken,
    logout,getProfile,
    getAllUsers
} = require("../controller/authController");

const {
    authLimiter,
    refreshLimiter
} = require("../middleware/rateLimiters");
const authorizeRoles = require("../middleware/roleMiddleware");

const authMiddleware = require("../middleware/authMiddleware");

// Register
router.post("/register",authLimiter,registerUser);

// Login
router.post("/login",authLimiter,loginUser);

// Refresh Access Token
router.post("/refresh",refreshLimiter,refreshAccessToken);

// Logout
router.post("/logout", logout);

// Protected Profile
router.get("/profile", authMiddleware,getProfile);

//admin only
router.get(
    "/",
    authMiddleware,
    authorizeRoles("admin"),
    getAllUsers
);

module.exports = router;