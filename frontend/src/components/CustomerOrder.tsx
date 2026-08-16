import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { MenuItem } from "../types";

interface CustomerOrderProps {
    tableNumber: string;
    onSessionExpired: () => void;
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

export function CustomerOrder({ tableNumber, onSessionExpired }: CustomerOrderProps) {
    const [menu, setMenu] = useState<MenuItem[]>([]);
    const [myOrders, setMyOrders] = useState<MyOrderItem[]>([]);
    const [message, setMessage] = useState("");

    async function loadMenu() {
        const res = await api.get("/menu");
        setMenu(res.data.data ?? []);
    }

    // หมายเหตุ: ยังไม่มี GET /me/order-items ใน backend
    // ใช้ placeholder ไปก่อน จะเพิ่ม endpoint นี้ในขั้นตอนถัดไป

    useEffect(() => {
        loadMenu();
    }, []);

    async function handleOrder(menuItemId: number) {
        setMessage("");
        try {
            await api.post("/me/order-items", {
                items: [{ menuItemId, quantity: 1, selectedOptionIds: [] }],
            });
            setMessage("สั่งอาหารสำเร็จ!");
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
        }
    }

    return (
        <div>
            <h2>โต๊ะ {tableNumber}</h2>
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

            <button style={{ marginTop: 24 }} onClick={handleRequestBill}>
                เรียกเก็บเงิน
            </button>
        </div>
    );
}