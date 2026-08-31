import { useEffect, useState } from "react";
import { api } from "../api/client";
import { card, cardGrid, mutedClass, priceClass } from "../ui";

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
            <h2 className="text-lg font-semibold mb-2">ยอดขายรวม</h2>
            <p className={`${priceClass} text-3xl`}>฿{totalRevenue.toLocaleString()}</p>

            <h3 className="text-base font-semibold mt-6 mb-2">ยอดขายรายวัน (30 วันล่าสุด)</h3>
            {sales.length === 0 && <p className={mutedClass}>ยังไม่มีข้อมูลยอดขาย</p>}
            <table className="w-full border-collapse">
                <tbody>
                    {sales.map((s) => (
                        <tr key={s.date} className="border-b border-border">
                            <td className="p-2">{s.date}</td>
                            <td className="p-2">{s.totalOrders} บิล</td>
                            <td className="p-2 text-right">฿{s.totalRevenue.toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h3 className="text-base font-semibold mt-6 mb-2">เมนูขายดี</h3>
            <div className={cardGrid}>
                {topSellers.map((item) => (
                    <div key={item.menuItemId} className={card}>
                        <h3 className="my-0 mb-1 text-lg">{item.name}</h3>
                        <p className={priceClass}>{item.totalQuantitySold} จาน</p>
                    </div>
                ))}
            </div>

            <h3 className="text-base font-semibold mt-6 mb-2">อัตราการยกเลิก</h3>
            {cancelRates.length === 0 && <p className={mutedClass}>ไม่มีข้อมูลการยกเลิก</p>}
            <div className={cardGrid}>
                {cancelRates.map((item) => (
                    <div key={item.menuItemId} className={card}>
                        <h3 className="my-0 mb-1 text-lg">{item.name}</h3>
                        <p className={mutedClass}>ยกเลิก {item.cancelledCount}/{item.totalOrdered} ครั้ง</p>
                        <p className={priceClass}>{item.cancelRatePercent}%</p>
                    </div>
                ))}
            </div>
        </div>
    );
}