import { useEffect, useState } from "react";
import { api } from "../api/client";
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
                    {NEXT_STATUS[item.status] && (
                        <button onClick={() => advanceStatus(item.id, item.status)}>
                            เปลี่ยนเป็น {STATUS_LABEL[NEXT_STATUS[item.status]]}
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
}