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

    // Restore session on application start
    useEffect(() => {
        if (restoreStarted.current) return;

        restoreStarted.current = true;

        const restoreSession = async () => {
            try {
                const data = await refreshAccessToken();

                setAccessToken(data.accessToken);

                const response = await apiRequest(
                    "/api/users/profile",
                    { method: "GET" },
                    data.accessToken
                );

                const profileData = await response.json();

                if (!response.ok) {
                    throw new Error(
                        profileData.message || "Profile failed"
                    );
                }

                setUser(profileData.user);

            } catch (error) {
                console.log("Session restore:", error.message);
                setAccessToken(null);
                setUser(null);

            } finally {
                setLoading(false);
            }
        };

        restoreSession();
    }, []);

    // Login
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

    // Logout
    const logout = async () => {
        try {
            await apiRequest(
                "/api/users/logout",
                { method: "POST" }
            );
        } finally {
            setAccessToken(null);
            setUser(null);
        }
    };

    // Protected API calls
    const request = async (endpoint, options = {}) => {
        let response = await apiRequest(
            endpoint,
            options,
            accessToken
        );

        if (response.status === 401) {
            try {
                const data = await refreshAccessToken();

                setAccessToken(data.accessToken);

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

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));

            throw new Error(
                data.message || "Request failed"
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