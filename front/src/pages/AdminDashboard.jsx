import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
    const { user, request, logout } = useAuth();
    const navigate = useNavigate();

    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        title: "",
        description: "",
        assignedTo: "",
        priority: "Medium"
    });

    const loadData = async () => {
        try {
            const [taskResponse, userResponse] = await Promise.all([
                request("/api/tasks"),
                request("/api/users")
            ]);

            const taskData = await taskResponse.json();
            const userData = await userResponse.json();

            setTasks(taskData.tasks);
            setUsers(userData.users);

        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const assignTask = async (e) => {
        e.preventDefault();

        try {
            const response = await request("/api/tasks", {
                method: "POST",
                body: JSON.stringify(form)
            });

            const data = await response.json();

            setForm({
                title: "",
                description: "",
                assignedTo: "",
                priority: "Medium"
            });

            await loadData();

            alert(data.message);

        } catch (err) {
            setError(err.message);
        }
    };

    const deleteTask = async (id) => {
        if (!window.confirm("Delete this task?")) return;

        try {
            await request(`/api/tasks/${id}`, {
                method: "DELETE"
            });

            await loadData();

        } catch (err) {
            setError(err.message);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between">
                <h2>Admin Dashboard</h2>
                <button className="btn btn-danger" onClick={handleLogout}>
                    Logout
                </button>
            </div>

            <p>Welcome, {user?.name} (Admin)</p>

            {error && (
                <div className="alert alert-danger">{error}</div>
            )}

            <div className="card p-3 mt-3">
                <h4>Assign New Task</h4>

                <form onSubmit={assignTask}>
                    <input
                        className="form-control mb-2"
                        name="title"
                        placeholder="Task title"
                        value={form.title}
                        onChange={handleChange}
                        required
                    />

                    <textarea
                        className="form-control mb-2"
                        name="description"
                        placeholder="Description"
                        value={form.description}
                        onChange={handleChange}
                    />

                    <select
                        className="form-select mb-2"
                        name="assignedTo"
                        value={form.assignedTo}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select user</option>

                        {users.map(item => (
                            <option key={item._id} value={item._id}>
                                {item.name} ({item.email})
                            </option>
                        ))}
                    </select>

                    <select
                        className="form-select mb-2"
                        name="priority"
                        value={form.priority}
                        onChange={handleChange}
                    >
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                    </select>

                    <button className="btn btn-primary">
                        Assign Task
                    </button>
                </form>
            </div>

            <h4 className="mt-4">All Tasks</h4>

            <div className="table-responsive">
                <table className="table table-bordered">
                    <thead>
                        <tr>
                            <th>Task</th>
                            <th>Assigned User</th>
                            <th>Priority</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {tasks.map(task => (
                            <tr key={task._id}>
                                <td>{task.title}</td>
                                <td>{task.assignedTo?.name}</td>
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
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AdminDashboard;