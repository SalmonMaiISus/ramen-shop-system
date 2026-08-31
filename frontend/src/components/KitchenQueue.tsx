import { useEffect, useState } from "react";
import { api } from "../api/client";
import { socket } from "../socket";
import type { OrderItem } from "../types";
import { card, cardGrid, mutedClass, errorClass, statusTagClass, btnDark, btnAccent, btnMuted, inputClass } from "../ui";

const NEXT_STATUS: Record<string, string> = {
    pending: "cooking",
    cooking: "serving",
    serving: "served",
};

const STATUS_LABEL: Record<string, string> = {
    pending: "รอทำ",
    cooking: "กำลังทำ",
    serving: "พร้อมเสิร์ฟ",
    served: "เสิร์ฟแล้ว",
};

export function KitchenQueue() {
    const [items, setItems] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [cancellingId, setCancellingId] = useState<number | null>(null);
    const [reason, setReason] = useState("วัตถุดิบหมด");

    async function loadQueue() {
        try {
            const res = await api.get("/chef/order-items");
            setItems(res.data.data);
        } catch (err: any) {
            setError(err.response?.data?.error?.message ?? "Failed to load queue");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadQueue();

        const token = localStorage.getItem("accessToken");
        if (token) socket.emit("join_chef_dashboard", token);

        socket.on("order_item.created", loadQueue);
        socket.on("order_item.status_changed", loadQueue);

        return () => {
            socket.off("order_item.created", loadQueue);
            socket.off("order_item.status_changed", loadQueue);
        };
    }, []);

    async function advanceStatus(id: number, currentStatus: string) {
        const nextStatus = NEXT_STATUS[currentStatus];
        if (!nextStatus) return;
        try {
            await api.patch(`/chef/order-items/${id}/status`, { status: nextStatus });
            loadQueue();
        } catch (err: any) {
            setError(err.response?.data?.error?.message ?? "Update failed");
        }
    }

    async function handleCancel(id: number) {
        if (!reason.trim()) return;
        try {
            await api.post(`/chef/order-items/${id}/cancel`, { reason });
            setCancellingId(null);
            loadQueue();
        } catch (err: any) {
            setError(err.response?.data?.error?.message ?? "Cancel failed");
        }
    }

    async function moveQueue(id: number, direction: "up" | "down") {
        const index = items.findIndex((i) => i.id === id);
        const targetIndex = direction === "up" ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= items.length) return;

        const currentItem = items[index];
        const targetItem = items[targetIndex];

        await api.patch(`/chef/order-items/${currentItem.id}/queue-position`, { queuePosition: targetIndex });
        await api.patch(`/chef/order-items/${targetItem.id}/queue-position`, { queuePosition: index });
        loadQueue();
    }

    if (loading) return <p className={mutedClass}>กำลังโหลดคิว...</p>;
    if (error) return <p className={errorClass}>{error}</p>;
    if (items.length === 0) return <p className={mutedClass}>ไม่มีออเดอร์ในคิว</p>;

    return (
        <div className={cardGrid}>
            {items.map((item) => (
                <div key={item.id} className={card}>
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-muted bg-cream px-2.5 py-0.5 rounded-full">
                            โต๊ะ {item.session.table.tableNumber}
                        </span>
                        <span className={statusTagClass(item.status)}>{STATUS_LABEL[item.status]}</span>
                    </div>
                    <h3 className="my-2 mb-3 text-lg">{item.menuItemNameSnapshot}</h3>

                    <div className="flex gap-1 mb-2">
                        <button className="flex-1 py-1.5 rounded-lg border border-border bg-surface cursor-pointer" onClick={() => moveQueue(item.id, "up")}>↑</button>
                        <button className="flex-1 py-1.5 rounded-lg border border-border bg-surface cursor-pointer" onClick={() => moveQueue(item.id, "down")}>↓</button>
                    </div>

                    {NEXT_STATUS[item.status] && (
                        <button className={btnDark} onClick={() => advanceStatus(item.id, item.status)}>
                            เปลี่ยนเป็น {STATUS_LABEL[NEXT_STATUS[item.status]]}
                        </button>
                    )}

                    {cancellingId === item.id ? (
                        <div className="mt-2">
                            <select value={reason} onChange={(e) => setReason(e.target.value)} className={`${inputClass} mb-1.5`}>
                                <option value="วัตถุดิบหมด">วัตถุดิบหมด</option>
                                <option value="ทำไม่ทัน">ทำไม่ทัน</option>
                                <option value="อื่นๆ">อื่นๆ</option>
                            </select>
                            <button className={btnAccent} onClick={() => handleCancel(item.id)}>ยืนยันยกเลิก</button>
                            <button className={btnMuted} onClick={() => setCancellingId(null)}>ยกเลิก</button>
                        </div>
                    ) : (
                        <button className={btnAccent} onClick={() => setCancellingId(item.id)}>ของหมด (Cancel)</button>
                    )}
                </div>
            ))}
        </div>
    );
}