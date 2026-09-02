import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { SessionData } from "../types";

interface UnassignedItem {
    id: number;
    menuItemNameSnapshot: string;
    unitPriceSnapshot: string;
    quantity: number;
}

export function SplitBill() {
    const [sessions, setSessions] = useState<SessionData[]>([]);
    const [selectedSessionId, setSelectedSessionId] = useState<number | "">("");
    const [items, setItems] = useState<UnassignedItem[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [message, setMessage] = useState("");

    useEffect(() => {
        api.get("/staff/sessions").then((res) => setSessions(res.data.data ?? []));
    }, []);

    async function loadItems(id: number) {
        const res = await api.get(`/staff/sessions/${id}/unassigned-items`);
        setItems(res.data.data ?? []);
        setSelectedIds([]);
    }

    function toggle(id: number) {
        setSelectedIds((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
    }

    async function createSplit() {
        if (!selectedSessionId || selectedIds.length === 0) return;
        try {
            const res = await api.post(`/staff/sessions/${selectedSessionId}/split-bill`, { orderItemIds: selectedIds });
            setMessage(`สร้างบิลย่อยสำเร็จ ยอด ฿${res.data.data.amount}`);
            loadItems(Number(selectedSessionId));
        } catch (err: any) {
            setMessage(err.response?.data?.error?.message ?? "สร้างบิลไม่สำเร็จ");
        }
    }

    const total = items.filter((i) => selectedIds.includes(i.id)).reduce((s, i) => s + Number(i.unitPriceSnapshot) * i.quantity, 0);

    return (
        <div>
            <h1 className="text-xl font-semibold mb-4">แยกบิล</h1>
            <select
                className="input max-w-xs mb-4"
                value={selectedSessionId}
                onChange={(e) => {
                    const id = e.target.value ? Number(e.target.value) : "";
                    setSelectedSessionId(id);
                    if (id) loadItems(id);
                }}
            >
                <option value="">-- เลือกโต๊ะ --</option>
                {sessions.map((s) => <option key={s.id} value={s.id}>โต๊ะ {s.table.tableNumber}</option>)}
            </select>

            {selectedSessionId && (
                <>
                    <div className="card-grid mb-4">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => toggle(item.id)}
                                className={`card cursor-pointer ${selectedIds.includes(item.id) ? "border-2 border-accent" : ""}`}
                            >
                                <h3 className="font-semibold">{item.menuItemNameSnapshot}</h3>
                                <p className="text-success font-bold">฿{item.unitPriceSnapshot} × {item.quantity}</p>
                            </div>
                        ))}
                        {items.length === 0 && <p className="text-muted text-sm">ไม่มีจานที่ยังไม่ได้จัดบิล</p>}
                    </div>
                    {selectedIds.length > 0 && (
                        <div>
                            <p className="mb-2">ยอดรวม: <strong>฿{total}</strong></p>
                            <button onClick={createSplit} className="btn-primary">สร้างบิลย่อย</button>
                        </div>
                    )}
                    {message && <p className="text-muted text-sm mt-3">{message}</p>}
                </>
            )}
        </div>
    );
}