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

function ProtectedRoute() {
    const { accessToken, loading } = useAuth();

    console.log("Protected Route Loading:", loading);
    console.log("Access Token Available:", !!accessToken);

    if (loading) {
        return (
            <div className="text-center mt-5">
                <h4>Checking session...</h4>
            </div>
        );
    }

    if (!accessToken) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}

export default ProtectedRoute;
