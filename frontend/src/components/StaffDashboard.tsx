import { useEffect, useState } from "react";
import { api } from "../api/client";

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

export function StaffDashboard() {
    const [bills, setBills] = useState<Bill[]>([]);
    const [servingItems, setServingItems] = useState<ServingItem[]>([]);
    const [error, setError] = useState("");

    async function loadData() {
        try {
            const [billsRes, servingRes] = await Promise.all([
                api.get("/staff/bills"),
                api.get("/staff/serving-items"),
            ]);
            setBills(billsRes.data.data ?? []);
            setServingItems(servingRes.data.data ?? []);
        } catch (err: any) {
            setError(err.response?.data?.error?.message ?? "Failed to load data");
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    async function handleServe(id: number) {
        await api.post(`/staff/serving-items/${id}/served`);
        loadData();
    }

    async function handleBillComing(id: number) {
        await api.patch(`/staff/bills/${id}/coming`);
        loadData();
    }

    async function handlePay(id: number) {
        await api.post(`/staff/bills/${id}/pay`, { paymentMethod: "cash" });
        loadData();
    }

    if (error) return <p className="error-text">{error}</p>;

    return (
        <div>
            <section>
                <h2>รอเสิร์ฟ</h2>
                {servingItems.length === 0 && <p className="muted">ไม่มีรายการรอเสิร์ฟ</p>}
                <div className="card-grid">
                    {servingItems.map((item) => (
                        <div key={item.id} className="order-card">
                            <span className="table-tag">โต๊ะ {item.session.table.tableNumber}</span>
                            <h3>{item.menuItemNameSnapshot}</h3>
                            <button onClick={() => handleServe(item.id)}>เสิร์ฟแล้ว</button>
                        </div>
                    ))}
                </div>
            </section>

            <section style={{ marginTop: 32 }}>
                <h2>คำขอเรียกบิล</h2>
                {bills.length === 0 && <p className="muted">ไม่มีคำขอเรียกบิล</p>}
                <div className="card-grid">
                    {bills.map((bill) => (
                        <div key={bill.id} className="order-card">
                            <span className="table-tag">โต๊ะ {bill.session.table.tableNumber}</span>
                            <h3>฿{bill.amount}</h3>
                            {bill.status === "waiting" && (
                                <button onClick={() => handleBillComing(bill.id)}>กำลังไป</button>
                            )}
                            {bill.status === "coming" && (
                                <button onClick={() => handlePay(bill.id)}>รับเงินแล้ว (เงินสด)</button>
                            )}
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}