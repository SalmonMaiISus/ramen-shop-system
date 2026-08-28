import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { MenuItem } from "../types";

interface Category {
    id: number;
    name: string;
}

interface OptionGroup {
    id: number;
    name: string;
    selectionType: string;
    options: { id: number; name: string; extraPrice: string }[];
}

export function AdminMenu() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [message, setMessage] = useState("");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
    const [editCategoryName, setEditCategoryName] = useState("");

    const [name, setName] = useState("");
    const [categoryId, setCategoryId] = useState<number | "">("");
    const [basePrice, setBasePrice] = useState("");
    const [description, setDescription] = useState("");

    // สำหรับ edit
    const [editName, setEditName] = useState("");
    const [editPrice, setEditPrice] = useState("");

    // สำหรับ option groups ของเมนูที่กำลังดูรายละเอียด
    const [detailItemId, setDetailItemId] = useState<number | null>(null);
    const [optionGroups, setOptionGroups] = useState<OptionGroup[]>([]);
    const [newGroupName, setNewGroupName] = useState("");
    const [newGroupType, setNewGroupType] = useState<"single" | "multiple">("single");
    const [newGroupIsRequired, setNewGroupIsRequired] = useState(false);
    const [newOptionName, setNewOptionName] = useState<Record<number, string>>({});
    const [newOptionPrice, setNewOptionPrice] = useState<Record<number, string>>({});

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

    function startEdit(item: MenuItem) {
        setEditingId(item.id);
        setEditName(item.name);
        setEditPrice(item.basePrice);
    }

    async function saveEdit(id: number) {
        await api.patch(`/admin/menu-items/${id}`, { name: editName, basePrice: Number(editPrice) });
        setEditingId(null);
        loadData();
    }

    async function handleDelete(id: number) {
        if (!confirm("ยืนยันลบเมนูนี้? (จะถูกซ่อนจากลูกค้า แต่ยังเก็บประวัติ order เก่าไว้)")) return;
        await api.delete(`/admin/menu-items/${id}`);
        loadData();
    }

    // Option groups
    async function openDetail(itemId: number) {
        setDetailItemId(itemId);
        const item = menuItems.find((m) => m.id === itemId) as any;
        setOptionGroups(item?.optionGroups ?? []);
    }

    async function refreshDetail() {
        const res = await api.get("/menu");
        const items = res.data.data ?? [];
        setMenuItems(items);
        const item = items.find((m: any) => m.id === detailItemId);
        setOptionGroups(item?.optionGroups ?? []);
    }

    async function handleCreateGroup() {
        if (!detailItemId || !newGroupName.trim()) return;
        await api.post("/admin/option-groups", {
            menuItemId: detailItemId,
            name: newGroupName,
            selectionType: newGroupType,
            isRequired: newGroupIsRequired,
        });
        setNewGroupName("");
        setNewGroupIsRequired(false);
        refreshDetail();
    }

    async function handleDeleteGroup(groupId: number) {
        await api.delete(`/admin/option-groups/${groupId}`);
        refreshDetail();
    }

    async function handleCreateOption(groupId: number) {
        const name = newOptionName[groupId];
        const price = newOptionPrice[groupId] || "0";
        if (!name?.trim()) return;
        await api.post("/admin/options", { optionGroupId: groupId, name, extraPrice: Number(price) });
        setNewOptionName((prev) => ({ ...prev, [groupId]: "" }));
        setNewOptionPrice((prev) => ({ ...prev, [groupId]: "" }));
        refreshDetail();
    }

    async function handleDeleteOption(optionId: number) {
        await api.delete(`/admin/options/${optionId}`);
        refreshDetail();
    }

    async function handleCreateCategory() {
        if (!newCategoryName.trim()) return;
        await api.post("/admin/categories", { name: newCategoryName, displayOrder: categories.length });
        setNewCategoryName("");
        loadData();
    }

    function startEditCategory(cat: Category) {
        setEditingCategoryId(cat.id);
        setEditCategoryName(cat.name);
    }

    async function saveEditCategory(id: number) {
        await api.patch(`/admin/categories/${id}`, { name: editCategoryName });
        setEditingCategoryId(null);
        loadData();
    }

    async function handleDeleteCategory(id: number) {
        try {
            await api.delete(`/admin/categories/${id}`);
            loadData();
        } catch (err: any) {
            alert(err.response?.data?.error?.message ?? "ลบไม่สำเร็จ (อาจมีเมนูอยู่ในหมวดนี้)");
        }
    }

    const detailItem = menuItems.find((m) => m.id === detailItemId);

    return (
        <div>
            <h2>จัดการหมวดหมู่</h2>
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                    <input
                        placeholder="ชื่อหมวดหมู่ใหม่"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        style={{ padding: 8, flex: 1, maxWidth: 200 }}
                    />
                    <button onClick={handleCreateCategory}>เพิ่มหมวดหมู่</button>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 32 }}>
                    {categories.map((cat) => (
                        <div key={cat.id} className="category-tag" style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px" }}>
                        {editingCategoryId === cat.id ? (
                            <>
                                <input
                                    value={editCategoryName}
                                    onChange={(e) => setEditCategoryName(e.target.value)}
                                    style={{ width: 100, padding: 4 }}
                                />
                                <button onClick={() => saveEditCategory(cat.id)} style={{ padding: "2px 8px" }}>✓</button>
                            </>
                        ) : (
                            <>
                                <span>{cat.name}</span>
                                <button onClick={() => startEditCategory(cat)} style={{ padding: "2px 8px" }}>แก้ไข</button>
                                <button onClick={() => handleDeleteCategory(cat.id)} style={{ padding: "2px 8px", background: "var(--accent)" }}>ลบ</button>
                            </>
                        )}
                    </div>
                ))}
            </div>
            
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
                    <input type="number" step="0.01" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} required />
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

                        {editingId === item.id ? (
                            <>
                                <input value={editName} onChange={(e) => setEditName(e.target.value)} style={{ width: "100%", marginTop: 8 }} />
                                <input
                                    type="number"
                                    value={editPrice}
                                    onChange={(e) => setEditPrice(e.target.value)}
                                    style={{ width: "100%", marginTop: 8, marginBottom: 8 }}
                                />
                                <button onClick={() => saveEdit(item.id)}>บันทึก</button>
                                <button onClick={() => setEditingId(null)} style={{ marginTop: 4, background: "var(--muted)" }}>
                                    ยกเลิก
                                </button>
                            </>
                        ) : (
                            <>
                                <h3>{item.name}</h3>
                                <p className="price">฿{item.basePrice}</p>
                                <button onClick={() => toggleAvailability(item.id, item.isAvailable)}>
                                    {item.isAvailable ? "ปิดขาย (หมด)" : "เปิดขาย"}
                                </button>
                                <button onClick={() => startEdit(item)} style={{ marginTop: 4 }}>
                                    แก้ไข
                                </button>
                                <button onClick={() => openDetail(item.id)} style={{ marginTop: 4, background: "var(--success)" }}>
                                    จัดการตัวเลือก
                                </button>
                                <button onClick={() => handleDelete(item.id)} style={{ marginTop: 4, background: "var(--accent)" }}>
                                    ลบเมนู
                                </button>
                            </>
                        )}
                    </div>
                ))}
            </div>

            {detailItem && (
                <div className="login-card" style={{ marginTop: 32, maxWidth: 500 }}>
                    <h3>ตัวเลือกของ: {detailItem.name}</h3>

                    {optionGroups.map((group) => (
                        <div key={group.id} style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 12, marginBottom: 12 }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <strong>{group.name} ({group.selectionType === "single" ? "เลือก 1" : "เลือกได้หลาย"})</strong>
                                <button onClick={() => handleDeleteGroup(group.id)} style={{ background: "var(--accent)", padding: "4px 10px" }}>
                                    ลบกลุ่ม
                                </button>
                            </div>
                            <ul style={{ paddingLeft: 16 }}>
                                {group.options.map((opt) => (
                                    <li key={opt.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                                        {opt.name} (+฿{opt.extraPrice})
                                        <button onClick={() => handleDeleteOption(opt.id)} style={{ padding: "2px 8px", background: "var(--muted)" }}>
                                            ลบ
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                                <input
                                    placeholder="ชื่อตัวเลือกใหม่"
                                    value={newOptionName[group.id] ?? ""}
                                    onChange={(e) => setNewOptionName((prev) => ({ ...prev, [group.id]: e.target.value }))}
                                    style={{ flex: 2, padding: 6 }}
                                />
                                <input
                                    placeholder="ราคาเพิ่ม"
                                    type="number"
                                    value={newOptionPrice[group.id] ?? ""}
                                    onChange={(e) => setNewOptionPrice((prev) => ({ ...prev, [group.id]: e.target.value }))}
                                    style={{ flex: 1, padding: 6 }}
                                />
                                <button onClick={() => handleCreateOption(group.id)}>เพิ่ม</button>
                            </div>
                        </div>
                    ))}

                    <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
                        <input
                            placeholder="ชื่อกลุ่มตัวเลือกใหม่ เช่น ความเผ็ด"
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                            style={{ flex: 2, padding: 8 }}
                        />
                        <select value={newGroupType} onChange={(e) => setNewGroupType(e.target.value as "single" | "multiple")} style={{ padding: 8 }}>
                            <option value="single">เลือก 1</option>
                            <option value="multiple">เลือกได้หลาย</option>
                        </select>
                        <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <input type="checkbox" checked={newGroupIsRequired} onChange={(e) => setNewGroupIsRequired(e.target.checked)} />
                            <span style={{ fontSize: 13 }}>บังคับเลือก</span>
                        </label>
                        <button onClick={handleCreateGroup}>เพิ่มกลุ่ม</button>
                    </div>

                    <button onClick={() => setDetailItemId(null)} style={{ marginTop: 12, background: "var(--muted)" }}>
                        ปิด
                    </button>
                </div>
            )}
        </div>
    );
}