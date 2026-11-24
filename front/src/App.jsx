import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";

import Register from "./pages/Register";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import ProtectedRoute from "./components/protectedRoute";

function HomeRedirect() {
    const { user, accessToken, loading } = useAuth();

    if (loading) {
        return <h4 className="text-center mt-5">Checking session...</h4>;
    }

    if (!accessToken || !user) {
        return <Navigate to="/login" replace />;
    }

    return user.role === "admin"
        ? <Navigate to="/admin" replace />
        : <Navigate to="/user" replace />;
}

function Unauthorized() {
    return (
        <div className="container mt-5 text-center">
            <h2>403 - Access Denied</h2>
            <p>You do not have permission to access this page.</p>
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<HomeRedirect />} />

                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />

                    <Route
                        element={
                            <ProtectedRoute allowedRoles={["admin"]} />
                        }
                    >
                        <Route
                            path="/admin"
                            element={<AdminDashboard />}
                        />
                    </Route>

                    <Route
                        element={
                            <ProtectedRoute allowedRoles={["user"]} />
                        }
                    >
                        <Route
                            path="/user"
                            element={<UserDashboard />}
                        />
                    </Route>

                    <Route
                        path="/unauthorized"
                        element={<Unauthorized />}
                    />
                    <Route
                        path="/forgot-password"
                        element={<ForgotPassword />}
                    />

                    <Route
                        path="/reset-password"
                        element={<ResetPassword />}
                    />

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;