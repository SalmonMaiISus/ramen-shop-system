import { useEffect, useState } from "react";
import { api } from "../api/client";

export function AdminReports() {
    const [sales, setSales] = useState<{ date: string; totalRevenue: number; totalOrders: number }[]>([]);
    const [topSellers, setTopSellers] = useState<{ menuItemId: number; name: string; totalQuantitySold: number }[]>([]);

    useEffect(() => {
        api.get("/admin/reports/sales").then((r) => setSales(r.data.data ?? []));
        api.get("/admin/reports/top-sellers").then((r) => setTopSellers(r.data.data ?? []));
    }, []);

    const totalRevenue = sales.reduce((s, x) => s + x.totalRevenue, 0);

    return (
        <div>
            <h1 className="text-xl font-semibold mb-4">รายงานยอดขาย</h1>
            <div className="card max-w-xs mb-6">
                <p className="text-muted text-sm">ยอดขายรวม</p>
                <p className="text-3xl font-bold text-success">฿{totalRevenue.toLocaleString()}</p>
            </div>

            <h2 className="font-semibold mb-2">เมนูขายดี</h2>
            <div className="card-grid mb-6">
                {topSellers.map((item) => (
                    <div key={item.menuItemId} className="card">
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-success font-bold">{item.totalQuantitySold} จาน</p>
                    </div>
                ))}
            </div>

            <h2 className="font-semibold mb-2">ยอดขายรายวัน</h2>
            <table className="w-full text-sm">
                <tbody>
                    {sales.map((s) => (
                        <tr key={s.date} className="border-b border-border">
                            <td className="py-2">{s.date}</td>
                            <td className="py-2">{s.totalOrders} บิล</td>
                            <td className="py-2 text-right font-semibold">฿{s.totalRevenue.toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}