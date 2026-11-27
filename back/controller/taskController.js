// const Task = require("../models/Task")
// const User = require("../models/User");
// // ADMIN: Create and assign task
// const createTask = async (req, res) => {
//     try {
//         const {
//             title,
//             description,
//             assignedTo,
//             priority,
//             dueDate
//         } = req.body;

//         if (!title || !assignedTo) {
//             return res.status(400).json({
//                 message: "Title and assigned user are required"
//             });
//         }
//         const assignedUser = await User.findOne({
//             _id: assignedTo,
//             role: "user"
//         });

//         if (!assignedUser) {
//             return res.status(404).json({
//                 message: "Assigned user not found"
//             });
//         }
//         const task = await Task.create({
//             title,
//             description,
//             assignedTo,
//             assignedBy: req.user._id,
//             priority: priority || "Medium",
//             dueDate: dueDate || null
//         });
//         return res.status(201).json({
//             message: "Task assigned successfully",
//             task
//         });
//     } catch (error) {
//         return res.status(500).json({
//             message: error.message
//         });
//     }
// };
// // ADMIN: Get all tasks
// // USER: Get only assigned tasks
// const getTasks = async (req, res) => {
//     try {
//         let filter = {};

//         if (req.user.role === "user") {
//             filter.assignedTo = req.user._id;
//         }
//         const tasks = await Task.find(filter)
//             .populate("assignedTo", "name email")
//             .populate("assignedBy", "name email")
//             .sort({ createdAt: -1 });

//         return res.status(200).json({
//             tasks
//         });

//     } catch (error) {
//         return res.status(500).json({
//             message: error.message
//         });
//     }
// };
// // USER: Update status of own task
// // ADMIN: Can update status of any task
// const updateTaskStatus = async (req, res) => {
//     try {
//         const { status } = req.body;

//         const allowedStatuses = [
//             "Pending",
//             "In Progress",
//             "Completed"
//         ];
//         if (!allowedStatuses.includes(status)) {
//             return res.status(400).json({
//                 message: "Invalid task status"
//             });
//         }

//         const filter = {
//             _id: req.params.id
//         };
//         if (req.user.role === "user") {
//             filter.assignedTo = req.user._id;
//         }
//         const task = await Task.findOneAndUpdate(
//             filter,
//             { status },
//             { new: true, runValidators: true }
//         );
//         if (!task) {
//             return res.status(404).json({
//                 message: "Task not found or access denied"
//             });
//         }

//         return res.status(200).json({
//             message: "Task status updated",
//             task
//         });

//     } catch (error) {
//         return res.status(500).json({
//             message: error.message
//         });
//     }
// };
// // ADMIN: Edit task details and assignment
// const updateTask = async (req, res) => {
//     try {
//         const allowedFields = [
//             "title",
//             "description",
//             "assignedTo",
//             "priority",
//             "dueDate"
//         ];

//         const updates = {};

//         for (const field of allowedFields) {
//             if (req.body[field] !== undefined) {
//                 updates[field] = req.body[field];
//             }
//         }
//         if (updates.assignedTo) {
//             const assignedUser = await User.findOne({
//                 _id: updates.assignedTo,
//                 role: "user"
//             });

//             if (!assignedUser) {
//                 return res.status(404).json({
//                     message: "Assigned user not found"
//                 });
//             }
//         }
//         const task = await Task.findByIdAndUpdate(
//             req.params.id,
//             updates,
//             { new: true, runValidators: true }
//         );
//         if (!task) {
//             return res.status(404).json({
//                 message: "Task not found"
//             });
//         }
//         return res.status(200).json({
//             message: "Task updated successfully",
//             task
//         });
//     } catch (error) {
//         return res.status(500).json({
//             message: error.message
//         });
//     }
// };
// // ADMIN: Delete task
// const deleteTask = async (req, res) => {
//     try {
//         const task = await Task.findByIdAndDelete(req.params.id);
//         if (!task) {
//             return res.status(404).json({
//                 message: "Task not found"
//             });
//         }
//         return res.status(200).json({
//             message: "Task deleted successfully"
//         });

//     } catch (error) {
//         return res.status(500).json({
//             message: error.message
//         });
//     }
// };
// module.exports = {
//     createTask,
//     getTasks,
//     updateTaskStatus,
//     updateTask,
//     deleteTask
// };



const Task = require("../models/Task");
const User = require("../models/User");
const mongoose = require("mongoose");
const logger = require("../config/logger");

// ADMIN: Create and assign task
const createTask = async (req, res) => {
    try {
        const {
            title,
            description,
            assignedTo,
            priority,
            dueDate
        } = req.body;

        if (!title || !assignedTo) {
            logger.warn("Task creation failed: Missing title or assigned user", {
                adminId: req.user._id
            });

            return res.status(400).json({
                message: "Title and assigned user are required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
            return res.status(400).json({
                message: "Invalid assigned user ID"
            });
        }

        const assignedUser = await User.findOne({
            _id: assignedTo,
            role: "user"
        });

        if (!assignedUser) {
            logger.warn("Task creation failed: Assigned user not found", {
                adminId: req.user._id,
                assignedTo
            });

            return res.status(404).json({
                message: "Assigned user not found"
            });
        }

        const task = await Task.create({
            title,
            description,
            assignedTo,
            assignedBy: req.user._id,
            priority: priority || "Medium",
            dueDate: dueDate || null
        });

        logger.info("Task created successfully", {
            taskId: task._id,
            assignedTo: assignedTo,
            adminId: req.user._id
        });

        return res.status(201).json({
            message: "Task assigned successfully",
            task
        });

    } catch (error) {
        logger.error("Create Task Error", {
            error: error.message,
            stack: error.stack,
            adminId: req.user?._id
        });

        return res.status(500).json({
            message: "Failed to create task"
        });
    }
};


// ADMIN: Get all tasks
// USER: Get only assigned tasks
const getTasks = async (req, res) => {
    try {
        let filter = {};

        if (req.user.role === "user") {
            filter.assignedTo = req.user._id;
        }

        const tasks = await Task.find(filter)
            .populate("assignedTo", "name email")
            .populate("assignedBy", "name email")
            .sort({ createdAt: -1 });

        logger.info("Tasks fetched successfully", {
            userId: req.user._id,
            role: req.user.role,
            count: tasks.length
        });

        return res.status(200).json({
            tasks
        });

    } catch (error) {
        logger.error("Get Tasks Error", {
            error: error.message,
            stack: error.stack,
            userId: req.user?._id
        });

        return res.status(500).json({
            message: "Failed to fetch tasks"
        });
    }
};


// USER: Update status of own task
// ADMIN: Can update status of any task
const updateTaskStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const allowedStatuses = [
            "Pending",
            "In Progress",
            "Completed"
        ];

        if (!allowedStatuses.includes(status)) {
            logger.warn("Invalid task status submitted", {
                userId: req.user._id,
                status
            });

            return res.status(400).json({
                message: "Invalid task status"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid task ID"
            });
        }

        const filter = {
            _id: req.params.id
        };

        if (req.user.role === "user") {
            filter.assignedTo = req.user._id;
        }

        const task = await Task.findOneAndUpdate(
            filter,
            { status },
            { new: true, runValidators: true }
        );

        if (!task) {
            logger.warn("Task status update failed: Task not found or access denied", {
                taskId: req.params.id,
                userId: req.user._id
            });

            return res.status(404).json({
                message: "Task not found or access denied"
            });
        }

        logger.info("Task status updated successfully", {
            taskId: task._id,
            status: task.status,
            updatedBy: req.user._id,
            role: req.user.role
        });

        return res.status(200).json({
            message: "Task status updated",
            task
        });

    } catch (error) {
        logger.error("Update Task Status Error", {
            error: error.message,
            stack: error.stack,
            userId: req.user?._id,
            taskId: req.params.id
        });

        return res.status(500).json({
            message: "Failed to update task status"
        });
    }
};


// ADMIN: Edit task details and assignment
const updateTask = async (req, res) => {
    try {
        const allowedFields = [
            "title",
            "description",
            "assignedTo",
            "priority",
            "dueDate"
        ];

        const updates = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                message: "No valid fields provided for update"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid task ID"
            });
        }

        if (updates.assignedTo) {
            if (!mongoose.Types.ObjectId.isValid(updates.assignedTo)) {
                return res.status(400).json({
                    message: "Invalid assigned user ID"
                });
            }

            const assignedUser = await User.findOne({
                _id: updates.assignedTo,
                role: "user"
            });

            if (!assignedUser) {
                return res.status(404).json({
                    message: "Assigned user not found"
                });
            }
        }

        const task = await Task.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        logger.info("Task updated successfully", {
            taskId: task._id,
            adminId: req.user._id,
            updatedFields: Object.keys(updates)
        });

        return res.status(200).json({
            message: "Task updated successfully",
            task
        });

    } catch (error) {
        logger.error("Update Task Error", {
            error: error.message,
            stack: error.stack,
            adminId: req.user?._id,
            taskId: req.params.id
        });

        return res.status(500).json({
            message: "Failed to update task"
        });
    }
};


// ADMIN: Delete task
const deleteTask = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid task ID"
            });
        }

        const task = await Task.findByIdAndDelete(req.params.id);

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        logger.info("Task deleted successfully", {
            taskId: task._id,
            adminId: req.user._id
        });

        return res.status(200).json({
            message: "Task deleted successfully"
        });

    } catch (error) {
        logger.error("Delete Task Error", {
            error: error.message,
            stack: error.stack,
            adminId: req.user?._id,
            taskId: req.params.id
        });

        return res.status(500).json({
            message: "Failed to delete task"
        });
    }
};


module.exports = {
    createTask,
    getTasks,
    updateTaskStatus,
    updateTask,
    deleteTask
};
