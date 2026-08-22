import axios from "axios";

export const api = axios.create({
    baseURL: "http://localhost:4000/api/v1",
});

api.interceptors.request.use((config) => {
    const accessToken = localStorage.getItem("accessToken");
    const sessionToken = localStorage.getItem("sessionToken");
    if (accessToken) config.headers.Authorization = `Bearer ${ accessToken }`;
    if (sessionToken) config.headers["X-Session-Token"] = sessionToken;
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry && localStorage.getItem("refreshToken")) {
            originalRequest._retry = true;
            try {
                const refreshToken = localStorage.getItem("refreshToken");
                const res = await axios.post("http://localhost:4000/api/v1/auth/refresh", { refreshToken });
                localStorage.setItem("accessToken", res.data.data.accessToken);
                originalRequest.headers.Authorization = `Bearer ${ res.data.data.accessToken }`;
                return api(originalRequest);
            } catch {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
            }
        }
        return Promise.reject(error);
    }
);