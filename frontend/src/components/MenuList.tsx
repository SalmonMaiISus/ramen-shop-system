import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { MenuItem } from "../types";
import { card, cardGrid, categoryTag, priceClass, mutedClass, tagBase } from "../ui";

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

    if (loading) return <p className={mutedClass}>กำลังโหลดเมนู...</p>;
    if (items.length === 0) return <p className={mutedClass}>ยังไม่มีเมนู</p>;

    return (
        <div className={cardGrid}>
            {items.map((item) => (
                <div key={item.id} className={card}>
                    <div className="flex justify-between items-center">
                        <span className={categoryTag}>{item.category.name}</span>
                        {!item.isAvailable && (
                            <span className={`${tagBase} bg-accentSoft text-accent`}>หมด</span>
                        )}
                    </div>
                    <h3 className="my-2 mb-3 text-lg">{item.name}</h3>
                    <p className={priceClass}>฿{item.basePrice}</p>
                </div>
            ))}
        </div >
    );
}