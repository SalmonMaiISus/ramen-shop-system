import { useEffect, useState } from "react";
import { api } from "../api/client";
import { socket } from "../socket";
import { card, cardGrid, mutedClass, errorClass, btnDark, btnMuted, inputClass } from "../ui";

interface Bill {
    id: number;
    amount: string;
    status: string;
    session: { table: { tableNumber: string } };
}

interface ServingItem {
    id: number;
    menuItemNameSnapshot: string;
    session: { table: { tableNumber: string } };
}

interface CancelledItem {
    id: number;
    menuItemNameSnapshot: string;
    cancelReason: string;
    session: { table: { tableNumber: string } };
}

interface SessionData {
    id: number;
    table: { tableNumber: string };
}

export function StaffDashboard() {
    const [bills, setBills] = useState<Bill[]>([]);
    const [servingItems, setServingItems] = useState<ServingItem[]>([]);
    const [cancellations, setCancellations] = useState<CancelledItem[]>([]);
    const [sessions, setSessions] = useState<SessionData[]>([]);
    const [error, setError] = useState("");

    async function loadData() {
        try {
            const [billsRes, servingRes, cancelRes, sessionsRes] = await Promise.all([
                api.get("/staff/bills"),
                api.get("/staff/serving-items"),
                api.get("/staff/cancellations"),
                api.get("/staff/sessions"),
            ]);
            setBills(billsRes.data.data ?? []);
            setServingItems(servingRes.data.data ?? []);
            setCancellations(cancelRes.data.data ?? []);
            setSessions(sessionsRes.data.data ?? []);
        } catch (err: any) {
            setError(err.response?.data?.error?.message ?? "Failed to load data");
        }
    }

    useEffect(() => {
        loadData();

        const token = localStorage.getItem("accessToken");
        if (token) socket.emit("join_staff_dashboard", token);

        socket.on("order_item.status_changed", loadData);
        socket.on("order_item.cancelled", loadData);
        socket.on("bill.requested", loadData);

        return () => {
            socket.off("order_item.status_changed", loadData);
            socket.off("order_item.cancelled", loadData);
            socket.off("bill.requested", loadData);
        };
    }, []);

    async function handleServe(id: number) {
        await api.post(`/staff/serving-items/${id}/served`);
        loadData();
    }

    async function handleBillComing(id: number) {
        await api.patch(`/staff/bills/${id}/coming`);
        loadData();
    }

    async function handlePay(id: number, paymentMethod: string) {
        await api.post(`/staff/bills/${id}/pay`, { paymentMethod });
        loadData();
    }

    async function handleNotify(id: number) {
        await api.post(`/staff/cancellations/${id}/notify`);
        loadData();
    }

    async function handleForceClose(sessionId: number) {
        if (!confirm("ยืนยันปิดโต๊ะนี้? (ใช้เมื่อลูกค้าออกไปแล้วโดยไม่ได้เช็คบิลผ่านระบบ)")) return;
        await api.post(`/staff/sessions/${sessionId}/force-close`);
        loadData();
    }

    if (error) return <p className={errorClass}>{error}</p>;

    return (
        <div>
            <section>
                <h2 className="text-lg font-semibold mb-3">⚠️ แจ้งเตือนลูกค้า (ของหมด)</h2>
                {cancellations.length === 0 && <p className={mutedClass}>ไม่มีรายการที่ต้องแจ้ง</p>}
                <div className={cardGrid}>
                    {cancellations.map((item) => (
                        <div key={item.id} className={`${card} border-accent`}>
                            <span className="text-xs text-muted bg-cream px-2.5 py-0.5 rounded-full">
                                โต๊ะ {item.session.table.tableNumber}
                            </span>
                            <h3 className="my-2 mb-1 text-lg">{item.menuItemNameSnapshot}</h3>
                            <p className={mutedClass}>เหตุผล: {item.cancelReason}</p>
                            <button className={btnDark} onClick={() => handleNotify(item.id)}>แจ้งลูกค้าแล้ว</button>
                        </div>
                    ))}
                </div>
            </section>

            <section className="mt-8">
                <h2 className="text-lg font-semibold mb-3">รอเสิร์ฟ</h2>
                {servingItems.length === 0 && <p className={mutedClass}>ไม่มีรายการรอเสิร์ฟ</p>}
                <div className={cardGrid}>
                    {servingItems.map((item) => (
                        <div key={item.id} className={card}>
                            <span className="text-xs text-muted bg-cream px-2.5 py-0.5 rounded-full">
                                โต๊ะ {item.session.table.tableNumber}
                            </span>
                            <h3 className="my-2 mb-3 text-lg">{item.menuItemNameSnapshot}</h3>
                            <button className={btnDark} onClick={() => handleServe(item.id)}>เสิร์ฟแล้ว</button>
                        </div>
                    ))}
                </div>
            </section>

            <section className="mt-8">
                <h2 className="text-lg font-semibold mb-3">คำขอเรียกบิล</h2>
                {bills.length === 0 && <p className={mutedClass}>ไม่มีคำขอเรียกบิล</p>}
                <div className={cardGrid}>
                    {bills.map((bill) => (
                        <div key={bill.id} className={card}>
                            <span className="text-xs text-muted bg-cream px-2.5 py-0.5 rounded-full">
                                โต๊ะ {bill.session.table.tableNumber}
                            </span>
                            <h3 className="my-2 mb-3 text-lg">฿{bill.amount}</h3>
                            {bill.status === "waiting" && (
                                <button className={btnDark} onClick={() => handleBillComing(bill.id)}>กำลังไป</button>
                            )}
                            {bill.status === "coming" && (
                                <div className="flex gap-1.5 mt-2">
                                    <select id={`pay-method-${bill.id}`} className={`${inputClass} flex-1`}>
                                        <option value="cash">เงินสด</option>
                                        <option value="qr_promptpay">พร้อมเพย์</option>
                                        <option value="credit_card">บัตรเครดิต</option>
                                    </select>
                                    <button
                                        className="py-2.5 px-4 rounded-lg bg-ink text-white text-sm cursor-pointer whitespace-nowrap"
                                        onClick={() => {
                                            const select = document.getElementById(`pay-method-${bill.id}`) as HTMLSelectElement;
                                            handlePay(bill.id, select.value);
                                        }}
                                    >
                                        รับเงินแล้ว
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            <section className="mt-8">
                <h2 className="text-lg font-semibold mb-3">โต๊ะที่มีลูกค้าอยู่</h2>
                {sessions.length === 0 && <p className={mutedClass}>ไม่มีโต๊ะที่ใช้งานอยู่</p>}
                <div className={cardGrid}>
                    {sessions.map((s) => (
                        <div key={s.id} className={card}>
                            <h3 className="my-0 mb-3 text-lg">โต๊ะ {s.table.tableNumber}</h3>
                            <button className={btnMuted} onClick={() => handleForceClose(s.id)}>ปิดโต๊ะ (Manual)</button>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}