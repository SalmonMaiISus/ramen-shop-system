import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { MenuItem } from "../types";
import {
    card,
    cardGrid,
    categoryTag,
    priceClass,
    mutedClass,
    loginCard,
    labelClass,
    inputClass,
    btnDark,
    btnAccent,
    btnMuted,
    btnSuccess,
} from "../ui";

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

    const [name, setName] = useState("");
    const [categoryId, setCategoryId] = useState<number | "">("");
    const [basePrice, setBasePrice] = useState("");
    const [description, setDescription] = useState("");

    const [editName, setEditName] = useState("");
    const [editPrice, setEditPrice] = useState("");

    const [newCategoryName, setNewCategoryName] = useState("");
    const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
    const [editCategoryName, setEditCategoryName] = useState("");

    const [detailItemId, setDetailItemId] = useState<number | null>(null);
    const [optionGroups, setOptionGroups] = useState<OptionGroup[]>([]);
    const [newGroupName, setNewGroupName] = useState("");
    const [newGroupType, setNewGroupType] = useState<"single" | "multiple">("single");
    const [newOptionName, setNewOptionName] = useState<Record<number, string>>({});
    const [newOptionPrice, setNewOptionPrice] = useState<Record<number, string>>({});

    async function loadData() {
        const [catRes, menuRes] = await Promise.all([api.get("/admin/categories"), api.get("/menu")]);
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
            isRequired: false,
        });
        setNewGroupName("");
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

    const detailItem = menuItems.find((m) => m.id === detailItemId);

    return (
        <div>
            <h2 className="text-lg font-semibold mb-3">จัดการหมวดหมู่</h2>
            <div className="flex gap-2 mb-3">
                <input
                    placeholder="ชื่อหมวดหมู่ใหม่"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className={`${inputClass} max-w-[200px]`}
                />
                <button className="py-2.5 px-4 rounded-lg bg-ink text-white text-sm" onClick={handleCreateCategory}>
                    เพิ่มหมวดหมู่
                </button>
            </div>
            <div className="flex gap-2 flex-wrap mb-8">
                {categories.map((cat) => (
                    <div key={cat.id} className={`${categoryTag} flex items-center gap-1.5 px-2.5 py-1.5`}>
                        {editingCategoryId === cat.id ? (
                            <>
                                <input
                                    value={editCategoryName}
                                    onChange={(e) => setEditCategoryName(e.target.value)}
                                    className="w-24 p-1 border border-border rounded"
                                />
                                <button onClick={() => saveEditCategory(cat.id)} className="px-2 py-0.5 bg-success text-white rounded">✓</button>
                            </>
                        ) : (
                            <>
                                <span>{cat.name}</span>
                                <button onClick={() => startEditCategory(cat)} className="px-2 py-0.5 bg-ink text-white rounded text-xs">แก้ไข</button>
                                <button onClick={() => handleDeleteCategory(cat.id)} className="px-2 py-0.5 bg-accent text-white rounded text-xs">ลบ</button>
                            </>
                        )}
                    </div>
                ))}
            </div>

            <h2 className="text-lg font-semibold mb-3">เพิ่มเมนูใหม่</h2>
            <form className={loginCard} onSubmit={handleSubmit}>
                <label className={labelClass}>
                    หมวดหมู่
                    <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : "")}
                        className={inputClass}
                    >
                        <option value="">-- เลือกหมวดหมู่ --</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </label>
                <label className={labelClass}>
                    ชื่อเมนู
                    <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
                </label>
                <label className={labelClass}>
                    ราคา (บาท)
                    <input
                        type="number"
                        step="0.01"
                        className={inputClass}
                        value={basePrice}
                        onChange={(e) => setBasePrice(e.target.value)}
                        required
                    />
                </label>
                <label className={labelClass}>
                    คำอธิบาย (ไม่บังคับ)
                    <input className={inputClass} value={description} onChange={(e) => setDescription(e.target.value)} />
                </label>
                {message && <p className={mutedClass}>{message}</p>}
                <button type="submit" className={btnAccent}>เพิ่มเมนู</button>
            </form>

            <h2 className="text-lg font-semibold mt-8 mb-3">เมนูทั้งหมด</h2>
            <div className={cardGrid}>
                {menuItems.map((item) => (
                    <div key={item.id} className={card}>
                        <span className={categoryTag}>{item.category.name}</span>

                        {editingId === item.id ? (
                            <>
                                <input
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className={`${inputClass} mt-2`}
                                />
                                <input
                                    type="number"
                                    value={editPrice}
                                    onChange={(e) => setEditPrice(e.target.value)}
                                    className={`${inputClass} mt-2 mb-2`}
                                />
                                <button className={btnDark} onClick={() => saveEdit(item.id)}>บันทึก</button>
                                <button className={btnMuted} onClick={() => setEditingId(null)}>ยกเลิก</button>
                            </>
                        ) : (
                            <>
                                <h3 className="my-2 mb-1 text-lg">{item.name}</h3>
                                <p className={priceClass}>฿{item.basePrice}</p>
                                <button className={btnDark} onClick={() => toggleAvailability(item.id, item.isAvailable)}>
                                    {item.isAvailable ? "ปิดขาย (หมด)" : "เปิดขาย"}
                                </button>
                                <button className={btnDark} onClick={() => startEdit(item)}>แก้ไข</button>
                                <button className={btnSuccess} onClick={() => openDetail(item.id)}>จัดการตัวเลือก</button>
                                <button className={btnAccent} onClick={() => handleDelete(item.id)}>ลบเมนู</button>
                            </>
                        )}
                    </div>
                ))}
            </div>

            {detailItem && (
                <div className={`${loginCard} mt-8 max-w-[500px]`}>
                    <h3 className="text-base font-semibold">ตัวเลือกของ: {detailItem.name}</h3>

                    {optionGroups.map((group) => (
                        <div key={group.id} className="border border-border rounded-lg p-3 mb-3">
                            <div className="flex justify-between">
                                <strong>
                                    {group.name} ({group.selectionType === "single" ? "เลือก 1" : "เลือกได้หลาย"})
                                </strong>
                                <button onClick={() => handleDeleteGroup(group.id)} className="bg-accent text-white px-2.5 py-1 rounded text-xs">
                                    ลบกลุ่ม
                                </button>
                            </div>
                            <ul className="pl-4">
                                {group.options.map((opt) => (
                                    <li key={opt.id} className="flex justify-between items-center mt-1">
                                        {opt.name} (+฿{opt.extraPrice})
                                        <button onClick={() => handleDeleteOption(opt.id)} className="px-2 py-0.5 bg-muted text-white rounded text-xs">
                                            ลบ
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            <div className="flex gap-1.5 mt-2">
                                <input
                                    placeholder="ชื่อตัวเลือกใหม่"
                                    value={newOptionName[group.id] ?? ""}
                                    onChange={(e) => setNewOptionName((prev) => ({ ...prev, [group.id]: e.target.value }))}
                                    className={`${inputClass} flex-[2] p-1.5`}
                                />
                                <input
                                    placeholder="ราคาเพิ่ม"
                                    type="number"
                                    value={newOptionPrice[group.id] ?? ""}
                                    onChange={(e) => setNewOptionPrice((prev) => ({ ...prev, [group.id]: e.target.value }))}
                                    className={`${inputClass} flex-1 p-1.5`}
                                />
                                <button onClick={() => handleCreateOption(group.id)} className="bg-ink text-white px-3 rounded-lg text-sm">
                                    เพิ่ม
                                </button>
                            </div>
                        </div>
                    ))}

                    <div className="flex gap-1.5 mt-3">
                        <input
                            placeholder="ชื่อกลุ่มตัวเลือกใหม่ เช่น ความเผ็ด"
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                            className={`${inputClass} flex-[2]`}
                        />
                        <select
                            value={newGroupType}
                            onChange={(e) => setNewGroupType(e.target.value as "single" | "multiple")}
                            className={inputClass}
                        >
                            <option value="single">เลือก 1</option>
                            <option value="multiple">เลือกได้หลาย</option>
                        </select>
                        <button onClick={handleCreateGroup} className="bg-ink text-white px-3 rounded-lg text-sm whitespace-nowrap">
                            เพิ่มกลุ่ม
                        </button>
                    </div>

                    <button className={btnMuted} onClick={() => setDetailItemId(null)}>ปิด</button>
                </div>
            )}
        </div>
    );
}