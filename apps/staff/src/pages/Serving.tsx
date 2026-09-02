import { useEffect, useState } from "react";
import { api } from "../api/client";
import { socket } from "../socket";
import type { OrderItem } from "../types";

export function Serving() {
    const [items, setItems] = useState<OrderItem[]>([]);

    async function load() {
        const res = await api.get("/staff/serving-items");
        setItems(res.data.data ?? []);
    }

    useEffect(() => {
        load();
        const token = localStorage.getItem("accessToken");
        if (token) socket.emit("join_staff_dashboard", token);
        socket.on("order_item.status_changed", load);
        return () => { socket.off("order_item.status_changed", load); };
    }, []);

    async function serve(id: number) {
        await api.post(`/staff/serving-items/${id}/served`);
        load();
    }

    return (
        <div>
            <h1 className="text-xl font-semibold mb-4">รอเสิร์ฟ</h1>
            {items.length === 0 && <p className="text-muted text-sm">ไม่มีรายการรอเสิร์ฟ</p>}
            <div className="card-grid">
                {items.map((item) => (
                    <div key={item.id} className="card">
                        <span className="text-xs text-muted">โต๊ะ {item.session.table.tableNumber}</span>
                        <h3 className="font-semibold my-2">{item.menuItemNameSnapshot}</h3>
                        <button onClick={() => serve(item.id)} className="btn-primary w-full">เสิร์ฟแล้ว</button>
                    </div>
                ))}
            </div>
        </div>
    );
}