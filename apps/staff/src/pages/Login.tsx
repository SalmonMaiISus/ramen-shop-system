import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UtensilsCrossed } from "lucide-react";
import { api } from "../api/client";
import { useAuth } from "../hooks/useAuth";
import { ThemeToggle } from "../components/ThemeToggle";
import { useTheme } from "../hooks/useTheme";

export function Login() {
    const [username, setUsername] = useState("admin");
    const [password, setPassword] = useState("password123");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res = await api.post("/auth/login", { username, password });
            const { accessToken, refreshToken, user } = res.data.data;
            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", refreshToken);
            login(user);
            navigate(user.role === "chef" ? "/kitchen" : user.role === "staff" ? "/serving" : "/admin/menu");
        } catch (err: any) {
            setError(err.response?.data?.error?.message ?? "เข้าสู่ระบบไม่สำเร็จ");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-canvas relative">
            <div className="absolute top-4 right-4"><ThemeToggle theme={theme} onToggle={toggleTheme} /></div>
            <form onSubmit={handleSubmit} className="card w-full max-w-sm flex flex-col gap-4">
                <div className="flex flex-col items-center gap-2 mb-2">
                    <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                        <UtensilsCrossed className="text-white" size={22} />
                    </div>
                    <h1 className="text-lg font-semibold">Ramen Staff Console</h1>
                </div>
                <label className="field">
                    Username
                    <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} />
                </label>
                <label className="field">
                    Password
                    <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
                </label>
                {error && <p className="text-danger text-xs">{error}</p>}
                <button type="submit" disabled={loading} className="btn-primary w-full">
                    {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
                </button>
            </form>
        </div>
    );
}