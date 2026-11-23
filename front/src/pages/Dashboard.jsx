import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
    const { user, logout, request } = useAuth();

    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [error, setError] = useState("");
    const [profileLoading, setProfileLoading] = useState(true);

    const profileStarted = useRef(false);

    useEffect(() => {
        if (profileStarted.current) return;

        profileStarted.current = true;

        const getProfile = async () => {
            try {
                const response = await request(
                    "/api/users/profile",
                    { method: "GET" }
                );

                const data = await response.json();

                setProfile(data.user);

            } catch (error) {
                setError(error.message);
                console.log("Dashboard Error:", error.message);

            } finally {
                setProfileLoading(false);
            }
        };

        getProfile();
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    return (
        <div className="container mt-5">

            <div className="card shadow">
                <div className="card-body">

                    <div className="d-flex justify-content-between">
                        <h2>Dashboard</h2>

                        <button
                            className="btn btn-danger"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </div>

                    <hr />

                    {profileLoading && (
                        <p>Loading profile...</p>
                    )}

                    {error && (
                        <div className="alert alert-danger">
                            {error}
                        </div>
                    )}

                    {!profileLoading && !error && (
                        <>
                            <h4>
                                Welcome, {profile?.name || user?.name || "User"}
                            </h4>

                            <p>Email: {profile?.email || user?.email}</p>

                            <p>
                                Contact: {profile?.contact || "Not available"}
                            </p>
                        </>
                    )}

                </div>
            </div>

        </div>
    );
}

export default Dashboard;