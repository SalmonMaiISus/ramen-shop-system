import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { MenuItem } from "../types";
import { socket } from "../socket";
import { OrderOptionsModal } from "./OrderOptionsModal";
import { card, cardGrid, categoryTag, priceClass, mutedClass, statusTagClass, btnDark, loginCard } from "../ui";

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

interface MyBill {
    id: number;
    amount: string;
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
    const [myBill, setMyBill] = useState<MyBill | null>(null);
    const [message, setMessage] = useState("");
    const [isRequestingBill, setIsRequestingBill] = useState(false);
    const [selectingItem, setSelectingItem] = useState<MenuItem | null>(null);

    async function loadMenu() {
        const res = await api.get("/menu");
        setMenu(res.data.data ?? []);
    }

    async function loadMyOrders() {
        const res = await api.get("/me/order-items");
        setMyOrders(res.data.data ?? []);
    }

    async function loadMyBill() {
        const res = await api.get("/me/bill");
        setMyBill(res.data.data);
    }

    useEffect(() => {
        loadMenu();
        loadMyOrders();
        loadMyBill();

        socket.emit("join_session", sessionToken);

        socket.on("order_item.status_changed", loadMyOrders);
        socket.on("order_item.cancelled", loadMyOrders);
        socket.on("order_item.notified", loadMyOrders);
        socket.on("bill.status_changed", loadMyBill);

        return () => {
            socket.off("order_item.status_changed", loadMyOrders);
            socket.off("order_item.cancelled", loadMyOrders);
            socket.off("order_item.notified", loadMyOrders);
            socket.off("bill.status_changed", loadMyBill);
        };
    }, [sessionToken]);

    async function handleOrder(menuItemId: number, selectedOptionIds: number[] = [], specialNotes?: string) {
        setMessage("");
        try {
            await api.post("/me/order-items", {
                items: [{ menuItemId, quantity: 1, selectedOptionIds, specialNotes: specialNotes || undefined }],
            });
            setMessage("สั่งอาหารสำเร็จ!");
            loadMyOrders();
            setSelectingItem(null);
        } catch (err: any) {
            const errorMessage = err.response?.data?.error?.message ?? "สั่งอาหารไม่สำเร็จ";
            setMessage(errorMessage);
            if (err.response?.status === 401) {
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
            loadMyBill();
        } catch (err: any) {
            const errorMessage = err.response?.data?.error?.message ?? "เรียกเก็บเงินไม่สำเร็จ";
            setMessage(errorMessage);
            if (err.response?.status === 401) {
                setTimeout(() => onSessionExpired(), 2000);
            }
        } finally {
            setIsRequestingBill(false);
        }
    }

    return (
        <div>
            <h2 className="text-ink text-xl font-semibold mb-2">โต๊ะ {tableNumber}</h2>
            {message && <p className={mutedClass}>{message}</p>}

            <div className={cardGrid}>
                {menu.map((item) => (
                    <div key={item.id} className={card}>
                        <span className={categoryTag}>{item.category.name}</span>
                        <h3 className="my-2 mb-1 text-lg">{item.name}</h3>
                        <p className={priceClass}>฿{item.basePrice}</p>
                        <button
                            className={btnDark}
                            disabled={!item.isAvailable}
                            onClick={() => (item.optionGroups.length > 0 ? setSelectingItem(item) : handleOrder(item.id))}
                        >
                            {item.isAvailable ? "สั่ง" : "สินค้าหมด"}
                        </button>
                    </div>
                ))}
            </div>

            <section className="mt-8 text-ink">
                <h2 className="text-lg font-semibold mb-3">ออเดอร์ของฉัน</h2>
                {myOrders.length === 0 && <p className={mutedClass}>ยังไม่มีรายการสั่ง</p>}
                <div className={cardGrid}>
                    {myOrders.map((item) => (
                        <div key={item.id} className={card}>
                            <span className={statusTagClass(item.status)}>{STATUS_LABEL[item.status] ?? item.status}</span>
                            <h3 className="my-2 mb-1 text-lg">{item.menuItemNameSnapshot}</h3>
                            <p className={priceClass}>฿{item.unitPriceSnapshot}</p>
                        </div>
                    ))}
                </div>
            </section>

            {myBill ? (
                <div className={`${loginCard} mt-6`}>
                    <h3 className="m-0 text-lg font-semibold">สถานะบิล</h3>
                    <p className={`${priceClass} text-2xl`}>฿{myBill.amount}</p>
                    <span className={statusTagClass(myBill.status)}>
                        {myBill.status === "waiting" && "รอพนักงาน"}
                        {myBill.status === "coming" && "พนักงานกำลังมา"}
                        {myBill.status === "paid" && "ชำระเงินแล้ว ขอบคุณครับ"}
                    </span>
                </div>
            ) : (
                <button className={`${btnDark} mt-6 max-w-xs`} onClick={handleRequestBill} disabled={isRequestingBill}>
                    {isRequestingBill ? "กำลังส่ง..." : "เรียกเก็บเงิน"}
                </button>
            )}

            {selectingItem && (
                <OrderOptionsModal
                    menuItem={selectingItem}
                    onCancel={() => setSelectingItem(null)}
                    onConfirm={(optionIds, notes) => handleOrder(selectingItem.id, optionIds, notes)}
                />
            )}
        </div>
    );
}