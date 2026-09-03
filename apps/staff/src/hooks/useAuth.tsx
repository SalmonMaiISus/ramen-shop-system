import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "../api/client";
import type { User } from "../types";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (u: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            setLoading(false);
            return;
        }
        api
            .get("/auth/me")
            .then((res) => setUser(res.data.data))
            .catch(() => {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
            })
            .finally(() => setLoading(false));
    }, []);

    function login(u: User) {
        setUser(u);
    }

    function logout() {
        api.post("/auth/logout").catch(() => { });
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setUser(null);
    }

    return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}