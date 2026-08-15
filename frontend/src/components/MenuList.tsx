import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { MenuItem } from "../types";

export function MenuList() {
    const [items, setItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api
            .get("/menu")
            .then((res) => setItems(res.data.data ?? []))
            .catch((err) => console.error("Failed to fetch menu:", err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p className="muted">กำลังโหลดเมนู...</p>;
    if (items.length === 0) return <p className="muted">ยังไม่มีเมนู</p>;

    return (
        <div className="card-grid">
            {items.map((item) => (
                <div key={item.id} className="menu-card">
                    <div className="menu-card-header">
                        <span className="category-tag">{item.category.name}</span>
                        {!item.isAvailable && <span className="status-tag sold-out">หมด</span>}
                    </div>
                    <h3>{item.name}</h3>
                    <p className="price">฿{item.basePrice}</p>
                </div>
            ))}
        </div>
    );
}