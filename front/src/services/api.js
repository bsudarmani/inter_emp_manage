const API_URL = import.meta.env.VITE_API_URL;

let refreshPromise = null;

export const apiRequest = async (
    endpoint,
    options = {},
    token = null
) => {
    const headers = {
        "Content-Type": "application/json",
        ...options.headers
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    return fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: "include"
    });
};

export const refreshAccessToken = async () => {
    if (!refreshPromise) {
        refreshPromise = apiRequest(
            "/api/users/refresh",
            { method: "POST" }
        )
        .then(async (response) => {
            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Refresh token failed"
                );
            }

            return data;
        })
        .finally(() => {
            refreshPromise = null;
        });
    }

    return refreshPromise;
};

export { API_URL };