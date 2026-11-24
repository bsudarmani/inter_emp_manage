const Task = require("../models/Task")
const User = require("../models/User");
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
            return res.status(400).json({
                message: "Title and assigned user are required"
            });
        }
        const assignedUser = await User.findOne({
            _id: assignedTo,
            role: "user"
        });

        if (!assignedUser) {
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
        return res.status(201).json({
            message: "Task assigned successfully",
            task
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message
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

        return res.status(200).json({
            tasks
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
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
            return res.status(400).json({
                message: "Invalid task status"
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
            return res.status(404).json({
                message: "Task not found or access denied"
            });
        }

        return res.status(200).json({
            message: "Task status updated",
            task
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
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
        if (updates.assignedTo) {
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
        return res.status(200).json({
            message: "Task updated successfully",
            task
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};
// ADMIN: Delete task
const deleteTask = async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }
        return res.status(200).json({
            message: "Task deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
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