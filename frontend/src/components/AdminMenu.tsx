import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { MenuItem } from "../types";

interface Category {
    id: number;
    name: string;
}

export function AdminMenu() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [message, setMessage] = useState("");

    const [name, setName] = useState("");
    const [categoryId, setCategoryId] = useState<number | "">("");
    const [basePrice, setBasePrice] = useState("");
    const [description, setDescription] = useState("");

    async function loadData() {
        const [catRes, menuRes] = await Promise.all([
            api.get("/admin/categories"),
            api.get("/menu"),
        ]);
        setCategories(catRes.data.data ?? []);
        setMenuItems(menuRes.data.data ?? []);
    }

    useEffect(() => {
        loadData();
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setMessage("");

        if (!categoryId) {
            setMessage("กรุณาเลือกหมวดหมู่");
            return;
        }

        try {
            await api.post("/admin/menu-items", {
                categoryId: Number(categoryId),
                name,
                description: description || undefined,
                basePrice: Number(basePrice),
            });
            setMessage("เพิ่มเมนูสำเร็จ!");
            setName("");
            setBasePrice("");
            setDescription("");
            loadData();
        } catch (err: any) {
            setMessage(err.response?.data?.error?.message ?? "เพิ่มเมนูไม่สำเร็จ");
        }
    }

    async function toggleAvailability(id: number, current: boolean) {
        await api.patch(`/admin/menu-items/${id}/availability`, { isAvailable: !current });
        loadData();
    }

    return (
        <div>
            <h2>เพิ่มเมนูใหม่</h2>
            <form className="login-card" onSubmit={handleSubmit}>
                <label>
                    หมวดหมู่
                    <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : "")}
                    >
                        <option value="">-- เลือกหมวดหมู่ --</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    ชื่อเมนู
                    <input value={name} onChange={(e) => setName(e.target.value)} required />
                </label>
                <label>
                    ราคา (บาท)
                    <input
                        type="number"
                        step="0.01"
                        value={basePrice}
                        onChange={(e) => setBasePrice(e.target.value)}
                        required
                    />
                </label>
                <label>
                    คำอธิบาย (ไม่บังคับ)
                    <input value={description} onChange={(e) => setDescription(e.target.value)} />
                </label>
                {message && <p className="muted">{message}</p>}
                <button type="submit">เพิ่มเมนู</button>
            </form>

            <h2 style={{ marginTop: 32 }}>เมนูทั้งหมด</h2>
            <div className="card-grid">
                {menuItems.map((item) => (
                    <div key={item.id} className="menu-card">
                        <span className="category-tag">{item.category.name}</span>
                        <h3>{item.name}</h3>
                        <p className="price">฿{item.basePrice}</p>
                        <button onClick={() => toggleAvailability(item.id, item.isAvailable)}>
                            {item.isAvailable ? "ปิดขาย (หมด)" : "เปิดขาย"}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}