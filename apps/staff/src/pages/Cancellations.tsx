import { useEffect, useState } from "react";
import { api } from "../api/client";
import { socket } from "../socket";
import type { OrderItem } from "../types";

export function Cancellations() {
    const [items, setItems] = useState<OrderItem[]>([]);

    async function load() {
        const res = await api.get("/staff/cancellations");
        setItems(res.data.data ?? []);
    }

    useEffect(() => {
        load();
        socket.on("order_item.cancelled", load);
        return () => { socket.off("order_item.cancelled", load); };
    }, []);

    async function notify(id: number) {
        await api.post(`/staff/cancellations/${id}/notify`);
        load();
    }

    return (
        <div>
            <h1 className="text-xl font-semibold mb-4">แจ้งเตือนลูกค้า (ของหมด)</h1>
            {items.length === 0 && <p className="text-muted text-sm">ไม่มีรายการที่ต้องแจ้ง</p>}
            <div className="card-grid">
                {items.map((item) => (
                    <div key={item.id} className="card border-danger">
                        <span className="text-xs text-muted">โต๊ะ {item.session.table.tableNumber}</span>
                        <h3 className="font-semibold my-2">{item.menuItemNameSnapshot}</h3>
                        <p className="text-muted text-sm mb-3">เหตุผล: {item.cancelReason}</p>
                        <button onClick={() => notify(item.id)} className="btn-primary w-full">แจ้งลูกค้าแล้ว</button>
                    </div>
                ))}
            </div>
        </div>
    );
}