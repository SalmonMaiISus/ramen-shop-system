import { useEffect, useState } from "react";
import { api } from "../api/client";

interface DailySale {
    date: string;
    totalRevenue: number;
    totalOrders: number;
}

interface TopSeller {
    menuItemId: number;
    name: string;
    totalQuantitySold: number;
}

interface CancellationRate {
    menuItemId: number;
    name: string;
    totalOrdered: number;
    cancelledCount: number;
    cancelRatePercent: number;
}

export function AdminReports() {
    const [sales, setSales] = useState<DailySale[]>([]);
    const [topSellers, setTopSellers] = useState<TopSeller[]>([]);
    const [cancelRates, setCancelRates] = useState<CancellationRate[]>([]);

    useEffect(() => {
        api.get("/admin/reports/sales").then((res) => setSales(res.data.data ?? []));
        api.get("/admin/reports/top-sellers").then((res) => setTopSellers(res.data.data ?? []));
        api.get("/admin/reports/cancellation-rate").then((res) => setCancelRates(res.data.data ?? []));
    }, []);

    const totalRevenue = sales.reduce((sum, s) => sum + s.totalRevenue, 0);

    return (
        <div>
            <h2>ยอดขายรวม</h2>
            <p className="price" style={{ fontSize: 28 }}>฿{totalRevenue.toLocaleString()}</p>

            <h3 style={{ marginTop: 24 }}>ยอดขายรายวัน (30 วันล่าสุด)</h3>
            {sales.length === 0 && <p className="muted">ยังไม่มีข้อมูลยอดขาย</p>}
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                    {sales.map((s) => (
                        <tr key={s.date} style={{ borderBottom: "1px solid var(--border)" }}>
                            <td style={{ padding: 8 }}>{s.date}</td>
                            <td style={{ padding: 8 }}>{s.totalOrders} บิล</td>
                            <td style={{ padding: 8, textAlign: "right" }}>฿{s.totalRevenue.toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h3 style={{ marginTop: 24 }}>เมนูขายดี</h3>
            <div className="card-grid">
                {topSellers.map((item) => (
                    <div key={item.menuItemId} className="menu-card">
                        <h3>{item.name}</h3>
                        <p className="price">{item.totalQuantitySold} จาน</p>
                    </div>
                ))}
            </div>

            <h3 style={{ marginTop: 24 }}>อัตราการยกเลิก</h3>
            {cancelRates.length === 0 && <p className="muted">ไม่มีข้อมูลการยกเลิก</p>}
            <div className="card-grid">
                {cancelRates.map((item) => (
                    <div key={item.menuItemId} className="menu-card">
                        <h3>{item.name}</h3>
                        <p className="muted">ยกเลิก {item.cancelledCount}/{item.totalOrdered} ครั้ง</p>
                        <p className="price">{item.cancelRatePercent}%</p>
                    </div>
                ))}
            </div>
        </div>
    );
}