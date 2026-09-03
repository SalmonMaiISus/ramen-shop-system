import { useEffect, useState } from "react";
import { api } from "../api/client";
import { StatusBadge } from "../components/StatusBadge";
import type { TableData } from "../types";

export function AdminTables() {
    const [tables, setTables] = useState<TableData[]>([]);
    const [newNumber, setNewNumber] = useState("");
    const [message, setMessage] = useState("");

    async function load() {
        const res = await api.get("/admin/tables");
        setTables(res.data.data ?? []);
    }

    useEffect(() => { load(); }, []);

    async function create(e: React.FormEvent) {
        e.preventDefault();
        try {
            await api.post("/admin/tables", { tableNumber: newNumber });
            setNewNumber(""); load();
        } catch (err: any) {
            setMessage(err.response?.data?.error?.message ?? "สร้างไม่สำเร็จ");
        }
    }

    async function regenerateQr(id: number) {
        if (!confirm("QR เดิมจะใช้ไม่ได้ ยืนยัน?")) return;
        await api.post(`/admin/tables/${id}/regenerate-qr`);
        load();
    }

    async function del(id: number) {
        await api.delete(`/admin/tables/${id}`);
        load();
    }

    const scanUrl = (token: string) => `${import.meta.env.VITE_CUSTOMER_APP_URL}/?token=${token}`;

    return (
        <div>
            <h1 className="text-xl font-semibold mb-4">จัดการโต๊ะ</h1>
            <form onSubmit={create} className="card max-w-sm flex flex-col gap-3 mb-6">
                <input className="input" placeholder="เลขโต๊ะใหม่" value={newNumber} onChange={(e) => setNewNumber(e.target.value)} required />
                {message && <p className="text-danger text-xs">{message}</p>}
                <button className="btn-primary">สร้างโต๊ะ + Generate QR</button>
            </form>

            <div className="card-grid">
                {tables.map((t) => (
                    <div key={t.id} className="card">
                        <h3 className="font-semibold mb-1">โต๊ะ {t.tableNumber}</h3>
                        <StatusBadge status={t.status} />
                        <p className="text-xs text-muted mt-2 break-all">{scanUrl(t.qrCodeToken)}</p>
                        <div className="flex flex-col gap-1.5 mt-3">
                            <button onClick={() => regenerateQr(t.id)} className="btn-secondary">สร้าง QR ใหม่</button>
                            <button onClick={() => del(t.id)} className="btn-danger">ลบโต๊ะ</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}