import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { MenuItem } from "../types";
import { socket } from "../socket";

interface CustomerOrderProps {
    tableNumber: string;
    onSessionExpired: () => void;
    sessionToken: string;
}

interface MyOrderItem {
    id: number;
    menuItemNameSnapshot: string;
    unitPriceSnapshot: string;
    status: string;
}

const STATUS_LABEL: Record<string, string> = {
    pending: "รอทำ",
    cooking: "กำลังทำ",
    serving: "พร้อมเสิร์ฟ",
    served: "เสิร์ฟแล้ว",
    cancelled_unnotified: "ถูกยกเลิก",
    cancelled_notified: "ถูกยกเลิก (แจ้งแล้ว)",
};

export function CustomerOrder({ tableNumber, onSessionExpired, sessionToken }: CustomerOrderProps) {
    const [menu, setMenu] = useState<MenuItem[]>([]);
    const [myOrders, setMyOrders] = useState<MyOrderItem[]>([]);
    const [message, setMessage] = useState("");
    const [isRequestingBill, setIsRequestingBill] = useState(false);

    async function loadMenu() {
        const res = await api.get("/menu");
        setMenu(res.data.data ?? []);
    }

    async function loadMyOrders() {
        const res = await api.get("/me/order-items");
        setMyOrders(res.data.data ?? []);
    }

    useEffect(() => {
        loadMenu();
        loadMyOrders();
        
        socket.emit("join_session", sessionToken);

        socket.on("order_item.status_changed", loadMyOrders);
        socket.on("order_item.cancelled", loadMyOrders);
        socket.on("order_item.notified", loadMyOrders);

        return () => {
            socket.off("order_item.status_changed", loadMyOrders);
            socket.off("order_item.cancelled", loadMyOrders);
            socket.off("order_item.notified", loadMyOrders);
        };
    }, [sessionToken]);

    async function handleOrder(menuItemId: number) {
        setMessage("");
        try {
            await api.post("/me/order-items", {
                items: [{ menuItemId, quantity: 1, selectedOptionIds: [] }],
            });
            setMessage("สั่งอาหารสำเร็จ!");
            loadMyOrders();
        } catch (err: any) {
            const errorMessage = err.response?.data?.error?.message ?? "สั่งอาหารไม่สำเร็จ"
            setMessage(errorMessage);

            if(err.response?.status == 401) {
                setTimeout(() => onSessionExpired(), 2000);
            }
        }
    }

    async function handleRequestBill() {
        setMessage("");
        if (isRequestingBill) return;
        setIsRequestingBill(true);
        try {
            const res = await api.post("/me/bill-requests");
            setMessage(`เรียกเก็บเงินแล้ว ยอดรวม ฿${res.data.data.amount}`);
        } catch (err: any) {
            const errorMessage = err.response?.data?.error?.message ?? "เรียกเก็บเงินไม่สำเร็จ";
            setMessage(errorMessage);

             if (err.response?.status === 401) {
                setTimeout(() => {
                    onSessionExpired();
                }, 2000);
            }
        } finally {
            setIsRequestingBill(false);
        }
    }

    return (
        <div>
            <h2 color="black">โต๊ะ {tableNumber}</h2>
            {message && <p className="muted">{message}</p>}

            <div className="card-grid">
                {menu.map((item) => (
                    <div key={item.id} className="menu-card">
                        <span className="category-tag">{item.category.name}</span>
                        <h3>{item.name}</h3>
                        <p className="price">฿{item.basePrice}</p>
                        <button disabled={!item.isAvailable} onClick={() => handleOrder(item.id)}>
                            {item.isAvailable ? "สั่ง" : "สินค้าหมด"}
                        </button>
                    </div>
                ))}
            </div>

            <section style={{ marginTop: 32 , color: "black"}}>
                <h2>ออเดอร์ของฉัน</h2>
                {myOrders.length === 0 && <p className="muted">ยังไม่มีรายการสั่ง</p>}
                <div className="card-grid">
                    {myOrders.map((item) => (
                        <div key={item.id} className="order-card">
                            <span className={`status-tag status-${item.status}`}>
                                {STATUS_LABEL[item.status] ?? item.status}
                            </span>
                            <h3>{item.menuItemNameSnapshot}</h3>
                            <p className="price">฿{item.unitPriceSnapshot}</p>
                        </div>
                    ))}
                </div>
            </section >

            <button style={{ marginTop: 24 }} onClick={handleRequestBill} disabled={isRequestingBill}>
                {isRequestingBill ? "กำลังส่ง..." : "เรียกเก็บเงิน"}
            </button>
        </div>
    );
}