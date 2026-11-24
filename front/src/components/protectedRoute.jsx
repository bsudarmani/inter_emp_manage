// import { Navigate, Outlet } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";

// const ProtectedRoute = () => {
//     const { accessToken, loading } = useAuth();

//     if (loading) {
//         return <h4 className="text-center mt-5">
//             Checking session...
//         </h4>;
//     }

//     return accessToken
//         ? <Outlet />
//         : <Navigate to="/login" replace />;
// };

// export default ProtectedRoute;

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ allowedRoles }) {
    const { user, accessToken, loading } = useAuth();

    if (loading) {
        return (
            <h4 className="text-center mt-5">
                Checking session...
            </h4>
        );
    }

    if (!accessToken || !user) {
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
}

export default ProtectedRoute;
