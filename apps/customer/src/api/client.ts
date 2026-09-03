import axios from "axios";

export const api = axios.create({
    baseURL: "http://localhost:4000/api/v1",
});

api.interceptors.request.use((config) => {
    const sessionToken = localStorage.getItem("sessionToken");
    if (sessionToken) config.headers["X-Session-Token"] = sessionToken;
    return config;
});

api.interceptors.response.use(
    (res) => res,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("sessionToken");
            localStorage.removeItem("tableNumber");
            window.location.reload();
        }
        return Promise.reject(error);
    }
);