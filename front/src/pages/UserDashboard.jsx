import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function UserDashboard() {
    const { user, request, logout } = useAuth();
    const navigate = useNavigate();

    const [tasks, setTasks] = useState([]);
    const [error, setError] = useState("");

    const loadTasks = async () => {
        try {
            const response = await request("/api/tasks");
            const data = await response.json();

            setTasks(data.tasks);

        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        loadTasks();
    }, []);

    const updateStatus = async (id, status) => {
        try {
            await request(`/api/tasks/${id}/status`, {
                method: "PATCH",
                body: JSON.stringify({ status })
            });

            await loadTasks();

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
                <h2>User Dashboard</h2>

                <button className="btn btn-danger" onClick={handleLogout}>
                    Logout
                </button>
            </div>

            <p>Welcome, {user?.name}</p>

            {error && (
                <div className="alert alert-danger">{error}</div>
            )}

            <h4 className="mt-4">My Assigned Tasks</h4>

            <div className="row">
                {tasks.map(task => (
                    <div className="col-md-6 mb-3" key={task._id}>
                        <div className="card shadow-sm">
                            <div className="card-body">
                                <h5>Main Task: {task.title}</h5>

                                <p>Next Task: {task.description}</p>

                                <p>
                                    Priority: {task.priority}
                                </p>

                                <p>
                                    Status: <strong>{task.status}</strong>
                                </p>
                                <label>Choose the Status:</label>
                                <select
                                    className="form-select"
                                    value={task.status}
                                    onChange={(e) =>
                                        updateStatus(
                                            task._id,
                                            e.target.value
                                        )
                                    }
                                >
                                    <option>Pending</option>
                                    <option>In Progress</option>
                                    <option>Completed</option>
                                </select>
                            </div>
                        </div>
                    </div>
                ))}

                {tasks.length === 0 && (
                    <p>No tasks assigned yet.</p>
                )}
            </div>
        </div>
    );
}

export default UserDashboard;