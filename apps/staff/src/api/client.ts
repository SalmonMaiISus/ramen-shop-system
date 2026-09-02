import axios from "axios";

export const api = axios.create({ baseURL: "http://localhost:4000/api/v1" });

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${ token }`;
    return config;
});

api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const original = error.config;
        if (error.response?.status === 401 && !original._retry && localStorage.getItem("refreshToken")) {
            original._retry = true;
            try {
                const refreshToken = localStorage.getItem("refreshToken");
                const res = await axios.post("http://localhost:4000/api/v1/auth/refresh", { refreshToken });
                localStorage.setItem("accessToken", res.data.data.accessToken);
                original.headers.Authorization = `Bearer ${ res.data.data.accessToken }`;
                return api(original);
            } catch {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);