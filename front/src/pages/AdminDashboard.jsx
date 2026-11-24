// import { useEffect, useState } from "react";
// import { useAuth } from "../context/AuthContext";
// import { useNavigate } from "react-router-dom";

// function AdminDashboard() {
//     const { user, request, logout } = useAuth();
//     const navigate = useNavigate();

//     const [tasks, setTasks] = useState([]);
//     const [users, setUsers] = useState([]);
//     const [error, setError] = useState("");

//     const [form, setForm] = useState({
//         title: "",
//         description: "",
//         assignedTo: "",
//         priority: "Medium"
//     });

//     const loadData = async () => {
//         try {
//             const [taskResponse, userResponse] = await Promise.all([
//                 request("/api/tasks"),
//                 request("/api/users")
//             ]);

//             const taskData = await taskResponse.json();
//             const userData = await userResponse.json();

//             setTasks(taskData.tasks);
//             setUsers(userData.users);

//         } catch (err) {
//             setError(err.message);
//         }
//     };

//     useEffect(() => {
//         loadData();
//     }, []);

//     const handleChange = (e) => {
//         setForm({
//             ...form,
//             [e.target.name]: e.target.value
//         });
//     };

//     const assignTask = async (e) => {
//         e.preventDefault();

//         try {
//             const response = await request("/api/tasks", {
//                 method: "POST",
//                 body: JSON.stringify(form)
//             });

//             const data = await response.json();

//             setForm({
//                 title: "",
//                 description: "",
//                 assignedTo: "",
//                 priority: "Medium"
//             });

//             await loadData();

//             alert(data.message);

//         } catch (err) {
//             setError(err.message);
//         }
//     };

//     const deleteTask = async (id) => {
//         if (!window.confirm("Delete this task?")) return;

//         try {
//             await request(`/api/tasks/${id}`, {
//                 method: "DELETE"
//             });

//             await loadData();

//         } catch (err) {
//             setError(err.message);
//         }
//     };

//     const handleLogout = async () => {
//         await logout();
//         navigate("/login");
//     };

//     return (
//         <div className="container mt-4">
//             <div className="d-flex justify-content-between">
//                 <h2>Admin Dashboard</h2>
//                 <button className="btn btn-danger" onClick={handleLogout}>
//                     Logout
//                 </button>
//             </div>

//             <p>Welcome, {user?.name} (Admin)</p>

//             {error && (
//                 <div className="alert alert-danger">{error}</div>
//             )}

//             <div className="card p-3 mt-3">
//                 <h4>Assign New Task</h4>

//                 <form onSubmit={assignTask}>
//                 <label className="h6 ">Enter the Task Title</label>
//                     <input
//                         className="form-control mb-2"
//                         name="title"
//                         placeholder="Task title"
//                         value={form.title}
//                         onChange={handleChange}
//                         required
//                     />
//                  <label className="h6">Enter the Task Description</label>
//                     <textarea
//                         className="form-control mb-2"
//                         name="description"
//                         placeholder="Description"
//                         value={form.description}
//                         onChange={handleChange}
//                     />
//                     <label className="h6">Enter the User selection</label>
//                     <select
//                         className="form-select mb-2"
//                         name="assignedTo"
//                         value={form.assignedTo}
//                         onChange={handleChange}
//                         required
//                     >
                     
//                         <option value="">Select user</option>

//                         {users.map(item => (
//                             <option key={item._id} value={item._id}>
//                                 {item.name} ({item.email})
//                             </option>
//                         ))}
//                     </select>
//                     <label className="h6">Select the User Task priority</label>
//                     <select
//                         className="form-select mb-2"
//                         name="priority"
//                         value={form.priority}
//                         onChange={handleChange}
//                     >
//                         <option>Low</option>
//                         <option>Medium</option>
//                         <option>High</option>
//                     </select>

//                     <button className="btn btn-primary">
//                         Assign Task
//                     </button>
//                 </form>
//             </div>

//             <h4 className="mt-4">All Tasks</h4>

//             <div className="table-responsive">
//                 <table className="table table-bordered">
//                     <thead>
//                         <tr>
//                             <th>Task</th>
//                             <th>Assigned User</th>
//                             <th>Priority</th>
//                             <th>Status</th>
//                             <th>Action</th>
//                         </tr>
//                     </thead>

//                     <tbody>
//                         {tasks.map(task => (
//                             <tr key={task._id}>
//                                 <td>{task.title}</td>
//                                 <td>{task.assignedTo?.name}</td>
//                                 <td>{task.priority}</td>
//                                 <td>{task.status}</td>
//                                 <td>
//                                     <button
//                                         className="btn btn-sm btn-danger"
//                                         onClick={() => deleteTask(task._id)}
//                                     >
//                                         Delete
//                                     </button>
//                                 </td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     );
// }

// export default AdminDashboard;




import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
    const { user, request, logout } = useAuth();
    const navigate = useNavigate();

    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [error, setError] = useState("");

    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        title: "",
        description: "",
        assignedTo: "",
        priority: "Medium"
    });

    // Individual field errors
    const [errors, setErrors] = useState({
        title: "",
        description: "",
        assignedTo: "",
        priority: ""
    });

    // Validation function
    const validateField = (name, value) => {
        switch (name) {

            case "title":
                if (!value.trim()) {
                    return "Task title is required";
                }
                if (value.trim().length < 3) {
                    return "Title must contain at least 3 characters";
                }
                if (value.trim().length > 100) {
                    return "Title cannot exceed 100 characters";
                }
                return "";

            case "description":
                if (value.length > 500) {
                    return "Description cannot exceed 500 characters";
                }
                return "";

            case "assignedTo":
                if (!value) {
                    return "Please select a user";
                }
                return "";

            case "priority":
                if (!["Low", "Medium", "High"].includes(value)) {
                    return "Please select a valid priority";
                }
                return "";

            default:
                return "";
        }
    };

    // Load tasks and users
    const loadData = useCallback(async () => {
        try {
            const [taskResponse, userResponse] = await Promise.all([
                request("/api/tasks"),
                request("/api/users")
            ]);

            const taskData = await taskResponse.json();
            const userData = await userResponse.json();

            if (!taskResponse.ok) {
                throw new Error(taskData.message || "Unable to load tasks");
            }

            if (!userResponse.ok) {
                throw new Error(userData.message || "Unable to load users");
            }

            setTasks(taskData.tasks || []);
            setUsers(userData.users || []);

        } catch (err) {
            setError(err.message || "Something went wrong");
        }
    }, [request]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;

        const updatedForm = {
            ...form,
            [name]: value
        };

        setForm(updatedForm);

        const message = validateField(name, value);

        setErrors((prev) => ({
            ...prev,
            [name]: message
        }));

        setError("");
    };

    // Assign task
    const assignTask = async (e) => {
        e.preventDefault();

        const newErrors = {};

        Object.keys(form).forEach((field) => {
            newErrors[field] = validateField(field, form[field]);
        });

        setErrors(newErrors);

        const hasErrors = Object.values(newErrors).some(
            (message) => message !== ""
        );

        if (hasErrors) {
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await request("/api/tasks", {
                method: "POST",
                body: JSON.stringify(form)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to assign task");
            }

            // Reset form
            setForm({
                title: "",
                description: "",
                assignedTo: "",
                priority: "Medium"
            });

            setErrors({
                title: "",
                description: "",
                assignedTo: "",
                priority: ""
            });

            await loadData();

            alert(data.message || "Task assigned successfully");

        } catch (err) {
            setError(err.message || "Task assignment failed");
        } finally {
            setLoading(false);
        }
    };

    // Delete task
    const deleteTask = async (id) => {
        if (!window.confirm("Delete this task?")) return;

        try {
            const response = await request(`/api/tasks/${id}`, {
                method: "DELETE"
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to delete task");
            }

            await loadData();

        } catch (err) {
            setError(err.message || "Delete failed");
        }
    };

    // Logout
    const handleLogout = async () => {
        try {
            await logout();
            navigate("/login");
        } catch (err) {
            setError(err.message || "Logout failed");
        }
    };

    return (
        <div className="container mt-4">

            {/* Header */}
            <div className="d-flex justify-content-between align-items-center">
                <h2 className="text-center">Admin Dashboard</h2>

                <button
                    className="btn btn-danger"
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </div>

            <p>Welcome, {user?.name} (Admin)</p>

            {/* API Error */}
            {error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}

            {/* Assign Task Form */}
            <div className="card shadow p-3 mt-3">

                <h4>Assign New Task</h4>

                <form onSubmit={assignTask} noValidate>

                    {/* Task Title */}
                    <div className="mb-3">

                        <label className="form-label fw-bold">
                            Enter Task Title
                        </label>

                        <input
                            type="text"
                            className={`form-control ${
                                errors.title ? "is-invalid" : ""
                            }`}
                            name="title"
                            placeholder="Enter task title"
                            value={form.title}
                            onChange={handleChange}
                        />

                        {errors.title && (
                            <small className="text-danger">
                                {errors.title}
                            </small>
                        )}

                    </div>

                    {/* Description */}
                    <div className="mb-3">

                        <label className="form-label fw-bold">
                            Enter Task Description
                        </label>

                        <textarea
                            className={`form-control ${
                                errors.description ? "is-invalid" : ""
                            }`}
                            name="description"
                            placeholder="Enter description (optional)"
                            value={form.description}
                            onChange={handleChange}
                            rows="3"
                        />

                        {errors.description && (
                            <small className="text-danger">
                                {errors.description}
                            </small>
                        )}

                        <small className="text-muted">
                            {form.description.length}/500 characters
                        </small>

                    </div>

                    {/* Assigned User */}
                    <div className="mb-3">

                        <label className="form-label fw-bold">
                            Select User
                        </label>

                        <select
                            className={`form-select ${
                                errors.assignedTo ? "is-invalid" : ""
                            }`}
                            name="assignedTo"
                            value={form.assignedTo}
                            onChange={handleChange}
                        >

                            <option value="">
                                Select user
                            </option>

                            {users.map((item) => (
                                <option key={item._id} value={item._id}>
                                    {item.name} ({item.email})
                                </option>
                            ))}

                        </select>

                        {errors.assignedTo && (
                            <small className="text-danger">
                                {errors.assignedTo}
                            </small>
                        )}

                    </div>

                    {/* Priority */}
                    <div className="mb-3">

                        <label className="form-label fw-bold">
                            Select Task Priority
                        </label>

                        <select
                            className={`form-select ${
                                errors.priority ? "is-invalid" : ""
                            }`}
                            name="priority"
                            value={form.priority}
                            onChange={handleChange}
                        >

                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>

                        </select>

                        {errors.priority && (
                            <small className="text-danger">
                                {errors.priority}
                            </small>
                        )}

                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="btn btn-secondary"
                        disabled={loading}
                    >
                        {loading ? "Assigning..." : "Assign Task"}
                    </button>

                </form>
            </div>

            {/* All Tasks */}
            <h4 className="mt-4">All Tasks</h4>

            <div className="table-responsive">

                <table className="table table-bordered table-striped">

                    <thead className="table-dark">
                        <tr>
                            <th>Task</th>
                            <th>Assigned User</th>
                            <th>Priority</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>

                    <tbody>

                        {tasks.length > 0 ? (

                            tasks.map((task) => (
                                <tr key={task._id}>

                                    <td>{task.title}</td>

                                    <td>
                                        {task.assignedTo?.name || "Unknown"}
                                    </td>

                                    <td>{task.priority}</td>

                                    <td>{task.status}</td>

                                    <td>
                                        <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() => deleteTask(task._id)}
                                        >
                                            Delete
                                        </button>
                                    </td>

                                </tr>
                            ))

                        ) : (

                            <tr>
                                <td colSpan="5" className="text-center">
                                    No tasks found
                                </td>
                            </tr>

                        )}

                    </tbody>

                </table>

            </div>

        </div>
    );
}

export default AdminDashboard;
