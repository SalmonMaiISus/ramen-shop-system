import { useEffect, useState } from "react";
import { api } from "../api/client";
import { socket } from "../socket";
import type { Bill } from "../types";

export function Bills() {
    const [bills, setBills] = useState<Bill[]>([]);
    const [paymentMethod, setPaymentMethod] = useState<Record<number, string>>({});

    async function load() {
        const res = await api.get("/staff/bills");
        setBills(res.data.data ?? []);
    }

    useEffect(() => {
        load();
        socket.on("bill.requested", load);
        return () => { socket.off("bill.requested", load); };
    }, []);

    async function markComing(id: number) {
        await api.patch(`/staff/bills/${id}/coming`);
        load();
    }

    async function pay(id: number) {
        await api.post(`/staff/bills/${id}/pay`, { paymentMethod: paymentMethod[id] ?? "cash" });
        load();
    }

    return (
        <div>
            <h1 className="text-xl font-semibold mb-4">คำขอเรียกบิล</h1>
            {bills.length === 0 && <p className="text-muted text-sm">ไม่มีคำขอเรียกบิล</p>}
            <div className="card-grid">
                {bills.map((bill) => (
                    <div key={bill.id} className="card">
                        <span className="text-xs text-muted">โต๊ะ {bill.session.table.tableNumber}</span>
                        <h3 className="font-bold text-lg text-success my-2">฿{bill.amount}</h3>
                        {bill.status === "waiting" && (
                            <button onClick={() => markComing(bill.id)} className="btn-primary w-full">กำลังไป</button>
                        )}
                        {bill.status === "coming" && (
                            <div className="flex gap-2">
                                <select
                                    className="input flex-1"
                                    value={paymentMethod[bill.id] ?? "cash"}
                                    onChange={(e) => setPaymentMethod((p) => ({ ...p, [bill.id]: e.target.value }))}
                                >
                                    <option value="cash">เงินสด</option>
                                    <option value="qr_promptpay">พร้อมเพย์</option>
                                    <option value="credit_card">บัตรเครดิต</option>
                                </select>
                                <button onClick={() => pay(bill.id)} className="btn-primary whitespace-nowrap">รับเงิน</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}