import {
    createContext,
    useContext,
    useEffect,
    useState,
    useRef
} from "react";

import {
    apiRequest,
    refreshAccessToken
} from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [accessToken, setAccessToken] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const restoreStarted = useRef(false);

    // 1. Restore session when application starts
   useEffect(() => {

    const restoreSession = async () => {

        try {
            console.log("Session Restore Started");

            const data = await refreshAccessToken();

            console.log("Refresh Successful");

            setAccessToken(data.accessToken);

            const response = await apiRequest(
                "/api/users/profile",
                { method: "GET" },
                data.accessToken
            );

            const profileData = await response.json();

            if (!response.ok) {
                throw new Error(
                    profileData.message || "Profile fetch failed"
                );
            }

            setUser(profileData.user);

            console.log("Profile Loaded Successfully");

        } catch (error) {

            console.log("Session Restore Error:", error.message);

            setAccessToken(null);
            setUser(null);

        } finally {

            console.log("Session Restore Completed");

            setLoading(false);
        }
    };

    restoreSession();

}, []);

    // 2. Login
    const login = async (email, password) => {
        const response = await apiRequest(
            "/api/users/login",
            {
                method: "POST",
                body: JSON.stringify({ email, password })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Login failed");
        }

        setAccessToken(data.accessToken);
        setUser(data.user);

        return data;
    };

    // 3. Logout
    const logout = async () => {
        try {
            await apiRequest(
                "/api/users/logout",
                { method: "POST" }
            );
        } catch (error) {
            console.error("Logout error:", error.message);
        } finally {
            setAccessToken(null);
            setUser(null);
        }
    };

    // 4. Protected API request
    const request = async (endpoint, options = {}) => {
        let response = await apiRequest(
            endpoint,
            options,
            accessToken
        );

        // Access Token expired
        if (response.status === 401) {
            try {
                const data = await refreshAccessToken();

                setAccessToken(data.accessToken);

                // Retry the original API only once
                response = await apiRequest(
                    endpoint,
                    options,
                    data.accessToken
                );

            } catch (error) {
                setAccessToken(null);
                setUser(null);
                throw error;
            }
        }

        if (response.status === 401) {
            setAccessToken(null);
            setUser(null);
            throw new Error("Session expired. Please login again.");
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));

            throw new Error(
                errorData.message || "API request failed"
            );
        }

        return response;
    };

    return (
        <AuthContext.Provider
            value={{
                accessToken,
                user,
                loading,
                login,
                logout,
                request
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);