import { useEffect, useRef, useState } from "react";
import { Pencil, Trash2, GripVertical, Upload, X, Check } from "lucide-react";
import { api } from "../api/client";
import type { MenuItem, Category } from "../types";

async function uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("image", file);
    const res = await api.post("/admin/upload", formData);
    return res.data.data.imageUrl;
}

export function AdminMenu() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [message, setMessage] = useState("");

    // Create item form
    const [name, setName] = useState("");
    const [categoryId, setCategoryId] = useState<number | "">("");
    const [basePrice, setBasePrice] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Category management
    const [newCategoryName, setNewCategoryName] = useState("");
    const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
    const [editCategoryName, setEditCategoryName] = useState("");
    const dragCategoryId = useRef<number | null>(null);

    // Menu item edit
    const [editingItemId, setEditingItemId] = useState<number | null>(null);
    const [editName, setEditName] = useState("");
    const [editPrice, setEditPrice] = useState("");
    const [editImageFile, setEditImageFile] = useState<File | null>(null);
    const [editImagePreview, setEditImagePreview] = useState<string | null>(null);

    // Option group/option detail panel
    const [detailItemId, setDetailItemId] = useState<number | null>(null);
    const [newGroupName, setNewGroupName] = useState("");
    const [newGroupType, setNewGroupType] = useState<"single" | "multiple">("single");
    const [newOptName, setNewOptName] = useState<Record<number, string>>({});
    const [newOptPrice, setNewOptPrice] = useState<Record<number, string>>({});
    const [editingGroupId, setEditingGroupId] = useState<number | null>(null);
    const [editGroupName, setEditGroupName] = useState("");
    const [editGroupType, setEditGroupType] = useState<"single" | "multiple">("single");
    const [editingOptionId, setEditingOptionId] = useState<number | null>(null);
    const [editOptionName, setEditOptionName] = useState("");
    const [editOptionPrice, setEditOptionPrice] = useState("");

    async function loadData() {
        const [c, m] = await Promise.all([api.get("/admin/categories"), api.get("/menu")]);
        setCategories(c.data.data ?? []);
        setMenuItems(m.data.data ?? []);
    }

    useEffect(() => {
        loadData();
    }, []);

    // Create Menu Item
    function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    }

    async function createItem(e: React.FormEvent) {
        e.preventDefault();
        setMessage("");
        if (!categoryId) return setMessage("กรุณาเลือกหมวดหมู่");
        try {
            let imageUrl: string | undefined;
            if (imageFile) imageUrl = await uploadImage(imageFile);

            await api.post("/admin/menu-items", {
                categoryId: Number(categoryId),
                name,
                basePrice: Number(basePrice),
                imageUrl,
            });
            setName("");
            setBasePrice("");
            setImageFile(null);
            setImagePreview(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            setMessage("เพิ่มเมนูสำเร็จ");
            loadData();
        } catch (err: any) {
            setMessage(err.response?.data?.error?.message ?? "เพิ่มเมนูไม่สำเร็จ");
        }
    }

    async function toggleAvailability(id: number, current: boolean) {
        await api.patch(`/admin/menu-items/${id}/availability`, { isAvailable: !current });
        loadData();
    }

    async function deleteItem(id: number) {
        if (!confirm("ยืนยันลบเมนูนี้?")) return;
        await api.delete(`/admin/menu-items/${id}`);
        loadData();
    }

    // Edit Menu Item 
    function startEditItem(item: MenuItem) {
        setEditingItemId(item.id);
        setEditName(item.name);
        setEditPrice(item.basePrice);
        setEditImageFile(null);
        setEditImagePreview((item as any).imageUrl ?? null);
    }

    function handleEditFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            setEditImageFile(file);
            setEditImagePreview(URL.createObjectURL(file));
        }
    }

    async function saveEditItem(id: number) {
        let imageUrl: string | undefined;
        if (editImageFile) imageUrl = await uploadImage(editImageFile);
        await api.patch(`/admin/menu-items/${id}`, {
            name: editName,
            basePrice: Number(editPrice),
            ...(imageUrl ? { imageUrl } : {}),
        });
        setEditingItemId(null);
        loadData();
    }

    // Category CRUD + Reorder
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

    function handleDragStart(id: number) {
        dragCategoryId.current = id;
    }

    function handleDragOver(e: React.DragEvent) {
        e.preventDefault();
    }

    async function handleDrop(targetId: number) {
        const draggedId = dragCategoryId.current;
        if (draggedId === null || draggedId === targetId) return;

        const reordered = [...categories];
        const fromIndex = reordered.findIndex((c) => c.id === draggedId);
        const toIndex = reordered.findIndex((c) => c.id === targetId);
        const [moved] = reordered.splice(fromIndex, 1);
        reordered.splice(toIndex, 0, moved);

        setCategories(reordered);
        dragCategoryId.current = null;

        // Record displayOrder
        await Promise.all(
            reordered.map((cat, index) => api.patch(`/admin/categories/${cat.id}`, { displayOrder: index }))
        );
        loadData();
    }

    // Option Groups 
    async function createGroup() {
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

    async function refreshDetail() {
        const res = await api.get("/menu");
        setMenuItems(res.data.data ?? []);
    }

    function startEditGroup(group: any) {
        setEditingGroupId(group.id);
        setEditGroupName(group.name);
        setEditGroupType(group.selectionType);
    }

    async function saveEditGroup(id: number) {
        await api.patch(`/admin/option-groups/${id}`, { name: editGroupName, selectionType: editGroupType });
        setEditingGroupId(null);
        refreshDetail();
    }

    async function deleteGroup(id: number) {
        if (!confirm("ลบกลุ่มตัวเลือกนี้ทั้งหมด?")) return;
        await api.delete(`/admin/option-groups/${id}`);
        refreshDetail();
    }

    async function createOption(groupId: number) {
        const name = newOptName[groupId];
        if (!name?.trim()) return;
        await api.post("/admin/options", { optionGroupId: groupId, name, extraPrice: Number(newOptPrice[groupId] ?? 0) });
        setNewOptName((p) => ({ ...p, [groupId]: "" }));
        setNewOptPrice((p) => ({ ...p, [groupId]: "" }));
        refreshDetail();
    }

    function startEditOption(opt: any) {
        setEditingOptionId(opt.id);
        setEditOptionName(opt.name);
        setEditOptionPrice(opt.extraPrice);
    }

    async function saveEditOption(id: number) {
        await api.patch(`/admin/options/${id}`, { name: editOptionName, extraPrice: Number(editOptionPrice) });
        setEditingOptionId(null);
        refreshDetail();
    }

    async function deleteOption(id: number) {
        await api.delete(`/admin/options/${id}`);
        refreshDetail();
    }

    const detailItem = menuItems.find((m) => m.id === detailItemId);

    return (
        <div>
            <h1 className="text-xl font-semibold mb-4">จัดการเมนู</h1>

            {/* Category Management */}
            <h2 className="font-semibold mb-2 text-sm text-muted">หมวดหมู่ (ลากเพื่อเรียงลำดับ)</h2>
            <div className="flex flex-col gap-1.5 mb-3 max-w-sm">
                {categories.map((cat) => (
                    <div
                        key={cat.id}
                        draggable
                        onDragStart={() => handleDragStart(cat.id)}
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(cat.id)}
                        className="flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-2 cursor-move"
                    >
                        <GripVertical size={15} className="text-muted shrink-0" />
                        {editingCategoryId === cat.id ? (
                            <>
                                <input
                                    value={editCategoryName}
                                    onChange={(e) => setEditCategoryName(e.target.value)}
                                    className="input py-1 flex-1"
                                />
                                <button onClick={() => saveEditCategory(cat.id)} className="icon-btn w-7 h-7"><Check size={14} /></button>
                            </>
                        ) : (
                            <>
                                <span className="flex-1 text-sm">{cat.name}</span>
                                <button onClick={() => startEditCategory(cat)} className="icon-btn w-7 h-7"><Pencil size={13} /></button>
                                <button onClick={() => handleDeleteCategory(cat.id)} className="icon-btn w-7 h-7 text-danger"><Trash2 size={13} /></button>
                            </>
                        )}
                    </div>
                ))}
            </div>
            <div className="flex gap-2 mb-8 max-w-sm">
                <input
                    placeholder="ชื่อหมวดหมู่ใหม่"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="input"
                />
                <button onClick={handleCreateCategory} className="btn-secondary whitespace-nowrap">เพิ่ม</button>
            </div>

            {/* Create Menu Item */}
            <h2 className="font-semibold mb-2 text-sm text-muted">เพิ่มเมนูใหม่</h2>
            <form onSubmit={createItem} className="card max-w-sm flex flex-col gap-3 mb-8">
                <select className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : "")}>
                    <option value="">-- หมวดหมู่ --</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <input className="input" placeholder="ชื่อเมนู" value={name} onChange={(e) => setName(e.target.value)} required />
                <input className="input" type="number" placeholder="ราคา" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} required />

                <div>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" id="new-item-image" />
                    <label htmlFor="new-item-image" className="btn-secondary w-full cursor-pointer flex items-center justify-center gap-2">
                        <Upload size={15} /> {imageFile ? imageFile.name : "เลือกรูปภาพ (ไม่บังคับ)"}
                    </label>
                    {imagePreview && (
                        <img src={imagePreview} alt="preview" className="w-full h-32 object-cover rounded-lg mt-2" />
                    )}
                </div>

                {message && <p className="text-muted text-xs">{message}</p>}
                <button className="btn-primary">เพิ่มเมนู</button>
            </form>

            {/* Menu Items Grid */}
            <h2 className="font-semibold mb-2 text-sm text-muted">เมนูทั้งหมด</h2>
            <div className="card-grid">
                {menuItems.map((item) => (
                    <div key={item.id} className="card">
                        {editingItemId === item.id ? (
                            <div className="flex flex-col gap-2">
                                {editImagePreview && (
                                    <img src={editImagePreview} alt="" className="w-full h-28 object-cover rounded-lg" />
                                )}
                                <input type="file" accept="image/*" onChange={handleEditFileSelect} className="text-xs" />
                                <input className="input" value={editName} onChange={(e) => setEditName(e.target.value)} />
                                <input className="input" type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} />
                                <div className="flex gap-2">
                                    <button onClick={() => saveEditItem(item.id)} className="btn-primary flex-1">บันทึก</button>
                                    <button onClick={() => setEditingItemId(null)} className="btn-secondary flex-1">ยกเลิก</button>
                                </div>
                            </div>
                        ) : (
                            <>
                                {(item as any).imageUrl && (
                                    <img src={(item as any).imageUrl} alt={item.name} className="w-full h-28 object-cover rounded-lg mb-2" />
                                )}
                                <span className="text-xs text-muted">{item.category.name}</span>
                                <h3 className="font-semibold my-1">{item.name}</h3>
                                <p className="text-success font-bold mb-2">฿{item.basePrice}</p>
                                <div className="flex flex-col gap-1.5">
                                    <button onClick={() => toggleAvailability(item.id, item.isAvailable)} className="btn-secondary">
                                        {item.isAvailable ? "ปิดขาย" : "เปิดขาย"}
                                    </button>
                                    <button onClick={() => startEditItem(item)} className="btn-secondary">แก้ไขข้อมูล</button>
                                    <button onClick={() => setDetailItemId(item.id)} className="btn-secondary">จัดการตัวเลือก</button>
                                    <button onClick={() => deleteItem(item.id)} className="btn-danger">ลบเมนู</button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>

            {/* Option Groups Detail Panel */}
            {detailItem && (
                <div className="card mt-6 max-w-lg">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold">ตัวเลือกของ: {detailItem.name}</h3>
                        <button onClick={() => setDetailItemId(null)} className="icon-btn"><X size={15} /></button>
                    </div>

                    {detailItem.optionGroups.map((g: any) => (
                        <div key={g.id} className="border border-border rounded-lg p-3 mb-3">
                            <div className="flex justify-between items-center mb-2">
                                {editingGroupId === g.id ? (
                                    <div className="flex gap-2 flex-1">
                                        <input className="input" value={editGroupName} onChange={(e) => setEditGroupName(e.target.value)} />
                                        <select className="input" value={editGroupType} onChange={(e) => setEditGroupType(e.target.value as any)}>
                                            <option value="single">เลือก 1</option>
                                            <option value="multiple">เลือกหลาย</option>
                                        </select>
                                        <button onClick={() => saveEditGroup(g.id)} className="icon-btn"><Check size={14} /></button>
                                    </div>
                                ) : (
                                    <>
                                        <strong className="text-sm">{g.name} ({g.selectionType === "single" ? "เลือก 1" : "เลือกหลาย"})</strong>
                                        <div className="flex gap-1">
                                            <button onClick={() => startEditGroup(g)} className="icon-btn w-7 h-7"><Pencil size={13} /></button>
                                            <button onClick={() => deleteGroup(g.id)} className="icon-btn w-7 h-7 text-danger"><Trash2 size={13} /></button>
                                        </div>
                                    </>
                                )}
                            </div>

                            <ul className="flex flex-col gap-1 mb-2">
                                {g.options.map((o: any) => (
                                    <li key={o.id} className="flex items-center gap-2 text-sm">
                                        {editingOptionId === o.id ? (
                                            <>
                                                <input className="input py-1 flex-1" value={editOptionName} onChange={(e) => setEditOptionName(e.target.value)} />
                                                <input className="input py-1 w-20" type="number" value={editOptionPrice} onChange={(e) => setEditOptionPrice(e.target.value)} />
                                                <button onClick={() => saveEditOption(o.id)} className="icon-btn w-7 h-7"><Check size={13} /></button>
                                            </>
                                        ) : (
                                            <>
                                                <span className="flex-1">{o.name} (+฿{o.extraPrice})</span>
                                                <button onClick={() => startEditOption(o)} className="icon-btn w-7 h-7"><Pencil size={12} /></button>
                                                <button onClick={() => deleteOption(o.id)} className="icon-btn w-7 h-7 text-danger"><Trash2 size={12} /></button>
                                            </>
                                        )}
                                    </li>
                                ))}
                            </ul>

                            <div className="flex gap-2">
                                <input
                                    className="input"
                                    placeholder="ตัวเลือกใหม่"
                                    value={newOptName[g.id] ?? ""}
                                    onChange={(e) => setNewOptName((p) => ({ ...p, [g.id]: e.target.value }))}
                                />
                                <input
                                    className="input w-24"
                                    type="number"
                                    placeholder="+฿"
                                    value={newOptPrice[g.id] ?? ""}
                                    onChange={(e) => setNewOptPrice((p) => ({ ...p, [g.id]: e.target.value }))}
                                />
                                <button onClick={() => createOption(g.id)} className="btn-secondary whitespace-nowrap">เพิ่ม</button>
                            </div>
                        </div>
                    ))}

                    <div className="flex gap-2 mt-3">
                        <input className="input" placeholder="ชื่อกลุ่มใหม่" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} />
                        <select className="input" value={newGroupType} onChange={(e) => setNewGroupType(e.target.value as any)}>
                            <option value="single">เลือก 1</option>
                            <option value="multiple">เลือกหลาย</option>
                        </select>
                        <button onClick={createGroup} className="btn-primary whitespace-nowrap">เพิ่มกลุ่ม</button>
                    </div>
                </div>
            )}
        </div>
    );
}