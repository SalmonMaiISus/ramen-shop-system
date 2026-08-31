import { useEffect, useState } from "react";
import { api } from "../api/client";
import { card, cardGrid, categoryTag, mutedClass, errorClass, loginCard, labelClass, inputClass, btnAccent, btnDark } from "../ui";

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
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editFullName, setEditFullName] = useState("");
    const [editRole, setEditRole] = useState("staff");

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

    function startEdit(u: UserData) {
        setEditingId(u.id);
        setEditFullName(u.fullName);
        setEditRole(u.role);
    }

    async function saveEdit(id: number) {
        await api.patch(`/admin/users/${id}`, { fullName: editFullName, role: editRole });
        setEditingId(null);
        loadUsers();
    }

    return (
        <div>
            <h2 className="text-lg font-semibold mb-3">จัดการพนักงาน</h2>
            <form className={loginCard} onSubmit={handleCreate}>
                <label className={labelClass}>
                    Username
                    <input className={inputClass} value={username} onChange={(e) => setUsername(e.target.value)} required />
                </label>
                <label className={labelClass}>
                    Password
                    <input type="password" className={inputClass} value={password} onChange={(e) => setPassword(e.target.value)} required />
                </label>
                <label className={labelClass}>
                    ชื่อ-นามสกุล
                    <input className={inputClass} value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                </label>
                <label className={labelClass}>
                    บทบาท
                    <select value={role} onChange={(e) => setRole(e.target.value)} className={inputClass}>
                        <option value="chef">Chef</option>
                        <option value="staff">Staff</option>
                        <option value="admin">Admin</option>
                    </select>
                </label>
                {message && <p className={errorClass}>{message}</p>}
                <button type="submit" className={btnAccent}>สร้างบัญชี</button>
            </form>

            <div className={`${cardGrid} mt-6`}>
                {users.map((u) => (
                    <div key={u.id} className={card}>
                        {editingId === u.id ? (
                            <>
                                <input
                                    value={editFullName}
                                    onChange={(e) => setEditFullName(e.target.value)}
                                    className={`${inputClass} mb-2`}
                                />
                                <select
                                    value={editRole}
                                    onChange={(e) => setEditRole(e.target.value)}
                                    className={`${inputClass} mb-2`}
                                >
                                    <option value="chef">Chef</option>
                                    <option value="staff">Staff</option>
                                    <option value="admin">Admin</option>
                                </select>
                                <button className={btnDark} onClick={() => saveEdit(u.id)}>บันทึก</button>
                                <button className="w-full mt-1 py-2 rounded-lg bg-muted text-white text-sm" onClick={() => setEditingId(null)}>
                                    ยกเลิก
                                </button>
                            </>
                        ) : (
                            <>
                                <span className={categoryTag}>{u.role}</span>
                                <h3 className="my-2 mb-1 text-lg">{u.fullName}</h3>
                                <p className={mutedClass}>@{u.username}</p>
                                <button className={btnDark} onClick={() => startEdit(u)}>แก้ไข</button>
                                <button className={btnDark} onClick={() => toggleActive(u.id, u.isActive)}>
                                    {u.isActive ? "ปิดใช้งาน" : "เปิดใช้งาน"}
                                </button>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}