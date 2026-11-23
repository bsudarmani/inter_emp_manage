const express = require("express");

const router = express.Router();

const {
    registerUser,
    loginUser,
    refreshAccessToken,
    logout,getProfile
} = require("../controller/authController");

const authMiddleware = require("../middleware/authMiddleware");

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Refresh Access Token
router.post("/refresh", refreshAccessToken);

// Logout
router.post("/logout", logout);

// Protected Profile
router.get("/profile", authMiddleware,getProfile);

module.exports = router;