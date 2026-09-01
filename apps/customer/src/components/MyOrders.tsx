import { useEffect, useState } from "react";
import { api } from "../api/client";
import { socket } from "../socket";
import type { MyOrderItem, MyBill } from "../type";

const STATUS_LABEL: Record<string, string> = {
    pending: "รอทำ",
    cooking: "กำลังทำ",
    serving: "พร้อมเสิร์ฟ",
    served: "เสิร์ฟแล้ว",
    cancelled_unnotified: "ถูกยกเลิก",
    cancelled_notified: "ถูกยกเลิก",
};

const STATUS_COLOR: Record<string, string> = {
    pending: "bg-accentSoft text-accent",
    cooking: "bg-yellow-100 text-yellow-800",
    serving: "bg-successSoft text-success",
    served: "bg-successSoft text-success",
    cancelled_unnotified: "bg-red-100 text-red-600",
    cancelled_notified: "bg-red-100 text-red-600",
};

interface MyOrdersProps {
    sessionToken: string;
}

export function MyOrders({ sessionToken }: MyOrdersProps) {
    const [orders, setOrders] = useState<MyOrderItem[]>([]);
    const [bill, setBill] = useState<MyBill | null>(null);
    const [requesting, setRequesting] = useState(false);
    const [message, setMessage] = useState("");

    async function loadOrders() {
        const res = await api.get("/me/order-items");
        setOrders(res.data.data ?? []);
    }

    async function loadBill() {
        const res = await api.get("/me/bill");
        setBill(res.data.data);
    }

    useEffect(() => {
        loadOrders();
        loadBill();
        socket.emit("join_session", sessionToken);
        socket.on("order_item.status_changed", loadOrders);
        socket.on("order_item.cancelled", loadOrders);
        socket.on("order_item.notified", loadOrders);
        socket.on("bill.status_changed", loadBill);
        return () => {
            socket.off("order_item.status_changed", loadOrders);
            socket.off("order_item.cancelled", loadOrders);
            socket.off("order_item.notified", loadOrders);
            socket.off("bill.status_changed", loadBill);
        };
    }, [sessionToken]);

    async function handleRequestBill() {
        setRequesting(true);
        setMessage("");
        try {
            const res = await api.post("/me/bill-requests");
            setMessage(`เรียกเก็บเงินแล้ว ยอด ฿${res.data.data.amount}`);
            loadBill();
        } catch (err: any) {
            setMessage(err.response?.data?.error?.message ?? "เรียกเก็บเงินไม่สำเร็จ");
        } finally {
            setRequesting(false);
        }
    }

    return (
        <div className="px-4 pb-24">
            <h2 className="text-base font-semibold my-4">ออเดอร์ของฉัน</h2>
            {orders.length === 0 && <p className="text-muted text-sm">ยังไม่มีรายการสั่ง</p>}
            <div className="flex flex-col gap-2">
                {orders.map((item) => (
                    <div key={item.id} className="card flex justify-between items-center">
                        <div>
                            <p className="text-sm font-semibold">{item.menuItemNameSnapshot}</p>
                            <p className="text-success text-sm font-bold">฿{item.unitPriceSnapshot}</p>
                        </div>
                        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${STATUS_COLOR[item.status] ?? ""}`}>
                            {STATUS_LABEL[item.status] ?? item.status}
                        </span>
                    </div>
                ))}
            </div>

            <div className="mt-6">
                {bill ? (
                    <div className="card">
                        <p className="text-sm font-semibold mb-1">สถานะบิล</p>
                        <p className="text-success text-xl font-bold">฿{bill.amount}</p>
                        <p className="text-xs text-muted mt-1">
                            {bill.status === "waiting" && "รอพนักงาน"}
                            {bill.status === "coming" && "พนักงานกำลังมา"}
                            {bill.status === "paid" && "ชำระเงินแล้ว ขอบคุณครับ"}
                        </p>
                    </div>
                ) : (
                    orders.length > 0 && (
                        <button
                            onClick={handleRequestBill}
                            disabled={requesting}
                            className="w-full py-3.5 rounded-full bg-ink text-canvas font-semibold disabled:opacity-50"
                        >
                            {requesting ? "กำลังส่ง..." : "เรียกเก็บเงิน"}
                        </button>
                    )
                )}
                {message && <p className="text-muted text-xs mt-2 text-center">{message}</p>}
            </div>
        </div>
    );
}