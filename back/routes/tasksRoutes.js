const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
    createTask,
    getTasks,
    updateTaskStatus,
    updateTask,
    deleteTask
} = require("../controller/taskController");

// Every task route requires login
router.use(authMiddleware);

// Admin only
router.post(
    "/",
    authorizeRoles("admin"),
    createTask
);

// Admin sees all tasks; user sees assigned tasks
router.get(
    "/",
    getTasks
);

// User can update own status; admin can update any status
router.patch(
    "/:id/status",
    updateTaskStatus
);

// Admin only
router.patch(
    "/:id",
    authorizeRoles("admin"),
    updateTask
);

router.delete(
    "/:id",
    authorizeRoles("admin"),
    deleteTask
);

module.exports = router;