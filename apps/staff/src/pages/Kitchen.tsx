import { useEffect, useState } from "react";
import { ArrowUp, ArrowDown, X } from "lucide-react";
import { api } from "../api/client";
import { socket } from "../socket";
import { StatusBadge } from "../components/StatusBadge";
import type { OrderItem } from "../types";

const NEXT_STATUS: Record<string, string> = { pending: "cooking", cooking: "serving", serving: "served" };
const NEXT_LABEL: Record<string, string> = { pending: "เริ่มทำ", cooking: "พร้อมเสิร์ฟ", serving: "เสิร์ฟแล้ว" };

export function Kitchen() {
    const [items, setItems] = useState<OrderItem[]>([]);
    const [cancellingId, setCancellingId] = useState<number | null>(null);
    const [reason, setReason] = useState("วัตถุดิบหมด");

    async function loadQueue() {
        const res = await api.get("/chef/order-items");
        setItems(res.data.data);
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

    async function advance(id: number, status: string) {
        await api.patch(`/chef/order-items/${id}/status`, { status: NEXT_STATUS[status] });
        loadQueue();
    }

    async function cancel(id: number) {
        await api.post(`/chef/order-items/${id}/cancel`, { reason });
        setCancellingId(null);
        loadQueue();
    }

    async function move(id: number, dir: "up" | "down") {
        const i = items.findIndex((x) => x.id === id);
        const j = dir === "up" ? i - 1 : i + 1;
        if (j < 0 || j >= items.length) return;
        await api.patch(`/chef/order-items/${items[i].id}/queue-position`, { queuePosition: j });
        await api.patch(`/chef/order-items/${items[j].id}/queue-position`, { queuePosition: i });
        loadQueue();
    }

    return (
        <div>
            <h1 className="text-xl font-semibold mb-4">คิวครัว</h1>
            {items.length === 0 && <p className="text-muted text-sm">ไม่มีออเดอร์ในคิว</p>}
            <div className="card-grid">
                {items.map((item) => (
                    <div key={item.id} className="card">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-muted">โต๊ะ {item.session.table.tableNumber}</span>
                            <StatusBadge status={item.status} />
                        </div>
                        <h3 className="font-semibold mb-3">{item.menuItemNameSnapshot}</h3>

                        <div className="flex gap-1.5 mb-2">
                            <button onClick={() => move(item.id, "up")} className="icon-btn flex-1"><ArrowUp size={15} /></button>
                            <button onClick={() => move(item.id, "down")} className="icon-btn flex-1"><ArrowDown size={15} /></button>
                        </div>

                        {NEXT_STATUS[item.status] && (
                            <button onClick={() => advance(item.id, item.status)} className="btn-primary w-full mb-2">
                                {NEXT_LABEL[item.status]}
                            </button>
                        )}

                        {cancellingId === item.id ? (
                            <div className="flex flex-col gap-2">
                                <select value={reason} onChange={(e) => setReason(e.target.value)} className="input">
                                    <option value="วัตถุดิบหมด">วัตถุดิบหมด</option>
                                    <option value="ทำไม่ทัน">ทำไม่ทัน</option>
                                    <option value="อื่นๆ">อื่นๆ</option>
                                </select>
                                <div className="flex gap-2">
                                    <button onClick={() => cancel(item.id)} className="btn-danger flex-1">ยืนยัน</button>
                                    <button onClick={() => setCancellingId(null)} className="btn-secondary flex-1"><X size={15} /></button>
                                </div>
                            </div>
                        ) : (
                            <button onClick={() => setCancellingId(item.id)} className="btn-secondary w-full text-danger">
                                ของหมด
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}