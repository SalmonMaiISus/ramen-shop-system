import { useEffect, useState } from "react";
import { api } from "../api/client";
import { card, cardGrid, mutedClass, errorClass, loginCard, labelClass, inputClass, btnAccent, btnDark, btnSuccess, statusTagClass } from "../ui";

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
            <h2 className="text-lg font-semibold mb-3">จัดการโต๊ะ</h2>
            <form className={loginCard} onSubmit={handleCreate}>
                <label className={labelClass}>
                    เลขโต๊ะใหม่
                    <input className={inputClass} value={newTableNumber} onChange={(e) => setNewTableNumber(e.target.value)} required />
                </label>
                {message && <p className={errorClass}>{message}</p>}
                <button type="submit" className={btnAccent}>สร้างโต๊ะ + Generate QR</button>
            </form>

            <div className={`${cardGrid} mt-6`}>
                {tables.map((table) => (
                    <div key={table.id} className={card}>
                        {editingId === table.id ? (
                            <>
                                <input
                                    value={editNumber}
                                    onChange={(e) => setEditNumber(e.target.value)}
                                    className={`${inputClass} mb-2`}
                                />
                                <button className={btnDark} onClick={() => saveEdit(table.id)}>บันทึก</button>
                                <button className="w-full mt-1 py-2 rounded-lg bg-muted text-white text-sm" onClick={() => setEditingId(null)}>
                                    ยกเลิก
                                </button>
                            </>
                        ) : (
                            <>
                                <h3 className="my-0 mb-2 text-lg">โต๊ะ {table.tableNumber}</h3>
                                <span className={statusTagClass(table.status === "occupied" ? "pending" : "serving")}>
                                    {table.status === "occupied" ? "มีลูกค้า" : "ว่าง"}
                                </span>
                                <p className={`${mutedClass} text-xs mt-2 break-all`}>Token: {table.qrCodeToken}</p>
                                <button className={btnDark} onClick={() => startEdit(table)}>แก้ไขเลขโต๊ะ</button>
                                <button className={btnSuccess} onClick={() => handleRegenerateQr(table.id)}>สร้าง QR ใหม่</button>
                                <button className={btnAccent} onClick={() => handleDelete(table.id)}>ลบโต๊ะ</button>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}