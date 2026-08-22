import { useEffect, useState } from "react";
import { api } from "../api/client";

interface SessionData {
    id: number;
    table: { tableNumber: string };
}

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
    const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);
    const [message, setMessage] = useState("");

    useEffect(() => {
        api.get("/staff/sessions").then((res) => setSessions(res.data.data ?? []));
    }, []);

    async function loadItems(sessionId: number) {
        const res = await api.get(`/staff/sessions/${sessionId}/unassigned-items`);
        setItems(res.data.data ?? []);
        setSelectedItemIds([]);
    }

    function toggleItem(id: number) {
        setSelectedItemIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    }

    async function handleCreateSplitBill() {
        if (!selectedSessionId || selectedItemIds.length === 0) return;
        setMessage("");
        try {
            const res = await api.post(`/staff/sessions/${selectedSessionId}/split-bill`, {
                orderItemIds: selectedItemIds,
            });
            setMessage(`สร้างบิลย่อยสำเร็จ ยอด ฿${res.data.data.amount}`);
            loadItems(Number(selectedSessionId));
        } catch (err: any) {
            setMessage(err.response?.data?.error?.message ?? "สร้างบิลไม่สำเร็จ");
        }
    }

    const selectedTotal = items
        .filter((i) => selectedItemIds.includes(i.id))
        .reduce((sum, i) => sum + Number(i.unitPriceSnapshot) * i.quantity, 0);

    return (
        <div>
            <h2>แยกบิล (Split Bill)</h2>

            <label className="muted" style={{ display: "block", marginBottom: 12 }}>
                เลือกโต๊ะ
                <select
                    value={selectedSessionId}
                    onChange={(e) => {
                        const id = e.target.value ? Number(e.target.value) : "";
                        setSelectedSessionId(id);
                        if (id) loadItems(id);
                    }}
                    style={{ display: "block", padding: 8, marginTop: 6, width: 200 }}
                >
                    <option value="">-- เลือกโต๊ะ --</option>
                    {sessions.map((s) => (
                        <option key={s.id} value={s.id}>
                            โต๊ะ {s.table.tableNumber}
                        </option>
                    ))}
                </select>
            </label>

            {selectedSessionId && (
                <>
                    <h3>เลือกจานที่จะแยกจ่าย</h3>
                    {items.length === 0 && <p className="muted">ไม่มีจานที่ยังไม่ได้จัดบิล</p>}
                    <div className="card-grid">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="menu-card"
                                style={{
                                    cursor: "pointer",
                                    borderColor: selectedItemIds.includes(item.id) ? "var(--accent)" : "var(--border)",
                                    borderWidth: selectedItemIds.includes(item.id) ? 2 : 1,
                                }}
                                onClick={() => toggleItem(item.id)}
                            >
                                <h3>{item.menuItemNameSnapshot}</h3>
                                <p className="price">฿{item.unitPriceSnapshot} × {item.quantity}</p>
                                {selectedItemIds.includes(item.id) && (
                                    <span className="status-tag status-serving">เลือกแล้ว</span>
                                )}
                            </div>
                        ))}
                    </div>

                    {selectedItemIds.length > 0 && (
                        <div style={{ marginTop: 16 }}>
                            <p>ยอดรวมที่เลือก: <strong>฿{selectedTotal}</strong></p>
                            <button onClick={handleCreateSplitBill}>สร้างบิลย่อย</button>
                        </div>
                    )}

                    {message && <p className="muted" style={{ marginTop: 12 }}>{message}</p>}
                </>
            )}
        </div>
    );
}