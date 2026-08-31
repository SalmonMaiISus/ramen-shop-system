import { useState } from "react";
import { api } from "../api/client";
import type { User } from "../types";
import { loginCard, labelClass, inputClass, errorClass, btnAccent } from "../ui";

interface LoginProps {
    onLoginSuccess: (user: User) => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
    const [username, setUsername] = useState("admin");
    const [password, setPassword] = useState("password123");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res = await api.post("/auth/login", { username, password });
            const { accessToken, refreshToken, user } = res.data.data;
            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", refreshToken);
            onLoginSuccess(user);
        } catch (err: any) {
            setError(err.response?.data?.error?.message ?? "Login failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form className={loginCard} onSubmit={handleSubmit}>
            <h2 className="m-0 text-lg font-semibold">เข้าสู่ระบบพนักงาน</h2>
            <label className={labelClass}>
                Username
                <input className={inputClass} value={username} onChange={(e) => setUsername(e.target.value)} />
            </label>
            <label className={labelClass}>
                Password
                <input
                    type="password"
                    className={inputClass}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </label>
            {error && <p className={errorClass}>{error}</p>}
            <button type="submit" className={btnAccent} disabled={loading}>
                {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </button>
        </form>
    );
}