const API_URL = import.meta.env.VITE_API_URL;

let refreshPromise = null;

export const apiRequest = async (
    endpoint,
    options = {},
    token = null
) => {
    const headers = {
        ...options.headers
    };

    if (!(options.body instanceof FormData) && options.body) {
        headers["Content-Type"] = "application/json";
    }

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
        .then(async response => {
            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Session expired"
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