import axios from "axios";

export const api = axios.create({
    baseURL: "http://localhost:4000/api/v1",
});

api.interceptors.request.use((config) => {
    const accessToken = localStorage.getItem("accessToken");
    const sessionToken = localStorage.getItem("sessionToken");

    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    if (sessionToken) {
        config.headers["X-Session-Token"] = sessionToken;
    }
    return config;
})