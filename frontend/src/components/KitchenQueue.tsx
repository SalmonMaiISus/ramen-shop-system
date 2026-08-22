import { useEffect, useState } from "react";
import { api } from "../api/client";
import { socket } from "../socket";
import type { OrderItem } from "../types";

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
        }
    }, []);

    async function advanceStatus(id: number, currentStatus: string) {
        const nextStatus = NEXT_STATUS[currentStatus];
        if (!nextStatus) return;

        try {
            await api.patch(`/chef/order-items/${id}/status`, { status: nextStatus });
            loadQueue(); // refresh รายการหลังเปลี่ยนสถานะสำเร็จ
        } catch (err: any) {
            setError(err.response?.data?.error?.message ?? "Update failed");
        }
    }

    async function handleCancel(id: number) {
        if (!reason.trim()) return;
        try {
            await api.post(`chef/order-items/${id}/cancel`, { reason });
            setCancellingId(null);
            setReason("");
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

    if (loading) return <p className="muted">กำลังโหลดคิว...</p>;
    if (error) return <p className="error-text">{error}</p>;
    if (items.length === 0) return <p className="muted">ไม่มีออเดอร์ในคิว</p>;

    return (
        <div className="card-grid">
            {items.map((item) => (
                <div key={item.id} className="order-card">
                    <div className="order-card-header">
                        <span className="table-tag">โต๊ะ {item.session.table.tableNumber}</span>
                        <span className={`status-tag status-${item.status}`}>
                            {STATUS_LABEL[item.status]}
                        </span>
                    </div>
                    <h3>{item.menuItemNameSnapshot}</h3>
                    <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                        <button onClick={() => moveQueue(item.id, "up")} style={{ flex: 1 }}>↑</button>
                        <button onClick={() => moveQueue(item.id, "down")} style={{ flex: 1 }}>↓</button>
                    </div>
                    {NEXT_STATUS[item.status] && (
                        <button onClick={() => advanceStatus(item.id, item.status)}>
                            เปลี่ยนเป็น {STATUS_LABEL[NEXT_STATUS[item.status]]}
                        </button>
                    )}
                    {cancellingId === item.id ? (
                        <div style={{ marginTop: 8 }}>
                            <select
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                style={{ width: "100%", padding: 8, marginBottom: 6 }}
                            >
                                <option value="วัตถุดิบหมด">วัตถุดิบหมด</option>
                                <option value="ทำไม่ทัน">ทำไม่ทัน</option>
                                <option value="อื่นๆ">อื่นๆ</option>
                            </select>
                            <button onClick={() => handleCancel(item.id)}>ยืนยันยกเลิก</button>
                            <button onClick={() => setCancellingId(null)} style={{ marginTop: 4, background: "var(--muted)" }}>
                            ยกเลิก
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setCancellingId(item.id)}
                            style={{ marginTop: 8, background: "var(--accent)" }}
                        >
                            ของหมด (Cancel)
                        </button>
                        )}
                </div>
            ))}
        </div>
    );
}

