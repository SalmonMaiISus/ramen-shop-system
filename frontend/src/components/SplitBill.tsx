import { useEffect, useState } from "react";
import { api } from "../api/client";
import { card, cardGrid, mutedClass, priceClass, statusTagClass, inputClass, btnDark } from "../ui";

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
        setSelectedItemIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
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
            <h2 className="text-lg font-semibold mb-3">แยกบิล (Split Bill)</h2>

            <label className={`${mutedClass} block mb-3`}>
                เลือกโต๊ะ
                <select
                    value={selectedSessionId}
                    onChange={(e) => {
                        const id = e.target.value ? Number(e.target.value) : "";
                        setSelectedSessionId(id);
                        if (id) loadItems(id);
                    }}
                    className={`${inputClass} block mt-1.5 w-52`}
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
                    <h3 className="text-base font-semibold mb-2">เลือกจานที่จะแยกจ่าย</h3>
                    {items.length === 0 && <p className={mutedClass}>ไม่มีจานที่ยังไม่ได้จัดบิล</p>}
                    <div className={cardGrid}>
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className={`${card} cursor-pointer ${selectedItemIds.includes(item.id) ? "border-2 border-accent" : ""
                                    }`}
                                onClick={() => toggleItem(item.id)}
                            >
                                <h3 className="my-2 mb-1 text-lg">{item.menuItemNameSnapshot}</h3>
                                <p className={priceClass}>฿{item.unitPriceSnapshot} × {item.quantity}</p>
                                {selectedItemIds.includes(item.id) && (
                                    <span className={statusTagClass("serving")}>เลือกแล้ว</span>
                                )}
                            </div>
                        ))}
                    </div>

                    {selectedItemIds.length > 0 && (
                        <div className="mt-4">
                            <p>ยอดรวมที่เลือก: <strong>฿{selectedTotal}</strong></p>
                            <button className={`${btnDark} max-w-xs`} onClick={handleCreateSplitBill}>สร้างบิลย่อย</button>
                        </div>
                    )}

                    {message && <p className={`${mutedClass} mt-3`}>{message}</p>}
                </>
            )}
        </div>
    );
}