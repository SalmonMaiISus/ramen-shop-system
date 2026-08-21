import { useEffect, useState } from "react";
import { api } from "../api/client";

interface UserData {
    id: number;
    username: string;
    fullName: string;
    role: string;
    isActive: boolean;
}

export function AdminUsers() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [role, setRole] = useState("staff");
    const [message, setMessage] = useState("");

    async function loadUsers() {
        const res = await api.get("/admin/users");
        setUsers(res.data.data ?? []);
    }

    useEffect(() => {
        loadUsers();
    }, []);

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        setMessage("");
        try {
            await api.post("/admin/users", { username, password, fullName, role });
            setUsername("");
            setPassword("");
            setFullName("");
            loadUsers();
        } catch (err: any) {
            setMessage(err.response?.data?.error?.message ?? "สร้างบัญชีไม่สำเร็จ");
        }
    }

    async function toggleActive(id: number, current: boolean) {
        await api.patch(`/admin/users/${id}/active`, { isActive: !current });
        loadUsers();
    }

    return (
        <div>
            <h2>จัดการพนักงาน</h2>
            <form className="login-card" onSubmit={handleCreate}>
                <label>
                    Username
                    <input value={username} onChange={(e) => setUsername(e.target.value)} required />
                </label>
                <label>
                    Password
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </label>
                <label>
                    ชื่อ-นามสกุล
                    <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                </label>
                <label>
                    บทบาท
                    <select value={role} onChange={(e) => setRole(e.target.value)}>
                        <option value="chef">Chef</option>
                        <option value="staff">Staff</option>
                        <option value="admin">Admin</option>
                    </select>
                </label>
                {message && <p className="error-text">{message}</p>}
                <button type="submit">สร้างบัญชี</button>
            </form>

            <div className="card-grid" style={{ marginTop: 24 }}>
                {users.map((u) => (
                    <div key={u.id} className="menu-card">
                        <span className="category-tag">{u.role}</span>
                        <h3>{u.fullName}</h3>
                        <p className="muted">@{u.username}</p>
                        <button onClick={() => toggleActive(u.id, u.isActive)}>
                            {u.isActive ? "ปิดใช้งาน" : "เปิดใช้งาน"}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}