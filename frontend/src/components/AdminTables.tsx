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
                        <h3>โต๊ะ {table.tableNumber}</h3>
                        <span className={`status-tag ${table.status === "occupied" ? "status-pending" : "status-serving"}`}>
                            {table.status === "occupied" ? "มีลูกค้า" : "ว่าง"}
                        </span>
                        <p className="muted" style={{ fontSize: 12, marginTop: 8, wordBreak: "break-all" }}>
                            Token: {table.qrCodeToken}
                        </p>
                        <button onClick={() => handleDelete(table.id)} style={{ background: "var(--accent)" }}>
                            ลบโต๊ะ
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}