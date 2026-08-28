import { useEffect, useState } from "react";
import { api } from "../api/client";

interface TableData {
    id: number;
    tableNumber: string;
    qrCodeToken: string;
    status: string;
}

export function AdminTables() {
    const [tables, setTables] = useState<TableData[]>([]);
    const [newTableNumber, setNewTableNumber] = useState("");
    const [message, setMessage] = useState("");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editNumber, setEditNumber] = useState("");

    async function loadTables() {
        const res = await api.get("/admin/tables");
        setTables(res.data.data ?? []);
    }

    useEffect(() => {
        loadTables();
    }, []);

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        setMessage("");
        try {
            await api.post("/admin/tables", { tableNumber: newTableNumber });
            setNewTableNumber("");
            loadTables();
        } catch (err: any) {
            setMessage(err.response?.data?.error?.message ?? "สร้างโต๊ะไม่สำเร็จ");
        }
    }

    async function handleDelete(id: number) {
        await api.delete(`/admin/tables/${id}`);
        loadTables();
    }

    function startEdit(table: TableData) {
        setEditingId(table.id);
        setEditNumber(table.tableNumber);
    }

    async function saveEdit(id: number) {
        try {
            await api.patch(`/admin/tables/${id}`, { tableNumber: editNumber });
            setEditingId(null);
            loadTables();
        } catch (err: any) {
            alert(err.response?.data?.error?.message ?? "แก้ไขไม่สำเร็จ");
        }
    }

    async function handleRegenerateQr(id: number) {
        if (!confirm("QR เดิมจะใช้ไม่ได้อีก ยืนยันสร้าง QR ใหม่?")) return;
        await api.post(`/admin/tables/${id}/regenerate-qr`);
        loadTables();
    }

    return (
        <div>
            <h2>จัดการโต๊ะ</h2>
            <form className="login-card" onSubmit={handleCreate}>
                <label>
                    เลขโต๊ะใหม่
                    <input value={newTableNumber} onChange={(e) => setNewTableNumber(e.target.value)} required />
                </label>
                {message && <p className="error-text">{message}</p>}
                <button type="submit">สร้างโต๊ะ + Generate QR</button>
            </form>

            <div className="card-grid" style={{ marginTop: 24 }}>
                {tables.map((table) => (
                    <div key={table.id} className="menu-card">
                        {editingId === table.id ? (
                            <>
                                <input
                                    value={editNumber}
                                    onChange={(e) => setEditNumber(e.target.value)}
                                    style={{ width: "100%", padding: 8, marginBottom: 8 }}
                                />
                                <button onClick={() => saveEdit(table.id)}>บันทึก</button>
                                <button onClick={() => setEditingId(null)} style={{ marginTop: 4, background: "var(--muted)" }}>
                                    ยกเลิก
                                </button>
                            </>
                        ) : (
                            <>
                                <h3>โต๊ะ {table.tableNumber}</h3>
                                <span className={`status-tag ${table.status === "occupied" ? "status-pending" : "status-serving"}`}>
                                    {table.status === "occupied" ? "มีลูกค้า" : "ว่าง"}
                                </span>
                                <p className="muted" style={{ fontSize: 12, marginTop: 8, wordBreak: "break-all" }}>
                                    Token: {table.qrCodeToken}
                                </p>
                                <button onClick={() => startEdit(table)}>แก้ไขเลขโต๊ะ</button>
                                <button onClick={() => handleRegenerateQr(table.id)} style={{ marginTop: 4, background: "var(--success)" }}>
                                    สร้าง QR ใหม่
                                </button>
                                <button onClick={() => handleDelete(table.id)} style={{ marginTop: 4, background: "var(--accent)" }}>
                                    ลบโต๊ะ
                                </button>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}