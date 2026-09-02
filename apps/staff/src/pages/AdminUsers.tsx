import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { StaffUser } from "../types";

export function AdminUsers() {
    const [users, setUsers] = useState<StaffUser[]>([]);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [role, setRole] = useState("staff");
    const [message, setMessage] = useState("");

    async function load() {
        const res = await api.get("/admin/users");
        setUsers(res.data.data ?? []);
    }

    useEffect(() => { load(); }, []);

    async function create(e: React.FormEvent) {
        e.preventDefault();
        try {
            await api.post("/admin/users", { username, password, fullName, role });
            setUsername(""); setPassword(""); setFullName(""); load();
        } catch (err: any) {
            setMessage(err.response?.data?.error?.message ?? "สร้างไม่สำเร็จ");
        }
    }

    async function toggleActive(id: number, current: boolean) {
        await api.patch(`/admin/users/${id}/active`, { isActive: !current });
        load();
    }

    return (
        <div>
            <h1 className="text-xl font-semibold mb-4">จัดการพนักงาน</h1>
            <form onSubmit={create} className="card max-w-sm flex flex-col gap-3 mb-6">
                <input className="input" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                <input className="input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <input className="input" placeholder="ชื่อ-นามสกุล" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="chef">Chef</option>
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                </select>
                {message && <p className="text-danger text-xs">{message}</p>}
                <button className="btn-primary">สร้างบัญชี</button>
            </form>

            <div className="card-grid">
                {users.map((u) => (
                    <div key={u.id} className="card">
                        <span className="text-xs text-muted">{u.role}</span>
                        <h3 className="font-semibold my-1">{u.fullName}</h3>
                        <p className="text-muted text-sm mb-2">@{u.username}</p>
                        <button onClick={() => toggleActive(u.id, u.isActive)} className="btn-secondary w-full">
                            {u.isActive ? "ปิดใช้งาน" : "เปิดใช้งาน"}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}