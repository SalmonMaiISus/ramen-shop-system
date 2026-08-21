import { PrismaClient } from "@prisma/client";
import { emitBillRequested, emitBillStatusChanged, emitOrderItemStatusChanged } from "../sockets";
import { includes } from "zod";

const prisma = new PrismaClient();

export class SessionNotFoundError extends Error { }
export class BillNotFoundError extends Error { }
export class NoOrderItemsError extends Error { }
export class OrderItemsInProgressError extends Error { }

// Customer กดเรียกเก็บเงิน
export async function requestBill(sessionId: number) {
    // If a bill is already requested or being handled, return it (idempotent)
    const existing = await prisma.bill.findFirst({
        where: { sessionId, status: { in: ["waiting", "coming"] } },
    });
    if (existing) return { bill: existing, created: false } as const;

    const orderItems = await prisma.orderItem.findMany({
        where: {
            sessionId,
            status: { not: { in: ["cancelled_unnotified", "cancelled_notified"] } },
        },
    });

    if (orderItems.length === 0) {
        throw new NoOrderItemsError();
    }

    // If any order item is still being prepared or in transit, prevent bill request
    const inProgressStatuses = ["pending", "cooking", "serving"];
    if (orderItems.some((it) => inProgressStatuses.includes(it.status))) {
        throw new OrderItemsInProgressError();
    }

    const amount = orderItems.reduce(
        (sum, item) => sum + Number(item.unitPriceSnapshot) * item.quantity, 0
    );

    const bill = await prisma.bill.create({
        data: { sessionId, amount, status: "waiting" },
    });

    await prisma.tableSession.update({
        where: { id: sessionId },
        data: { status: "bill_requested" },
    });

    const session = await prisma.tableSession.findUnique({
        where: { id: sessionId },
        include: { table: true },
    });
    if (session) {
        emitBillRequested(bill.id, session.table.tableNumber, amount);
    }

    return { bill, created: true } as const;
}

// Staff ดูรายการ bill ที่รอ
export async function getPendingBills() {
    return prisma.bill.findMany({
        where: { status: { in: ["waiting", "coming"] } },
        include: { session: { include: { table: true } } },
        orderBy: { requestedAt: "asc" },
    });
}

// Staff เปลี่ยนสถานะ waiting -> coming
export async function markBillComing(billId: number, staffUserId: number) {
    const bill = await prisma.bill.findUnique({ where: { id: billId }, include: { session: true } });
    if (!bill) throw new BillNotFoundError();

    const updated = prisma.bill.update({
        where: { id: billId },
        data: { status: "coming", handledBy: staffUserId, attendedAt: new Date() },
    });

    emitBillStatusChanged(bill.session.sessionToken, billId, "coming");
    return updated;
}

// Staff ยืนยันจ่ายเงินแล้ว + ปิด session
export async function markBillPaid(billId: number, paymentMethod: string) {
    const bill = await prisma.bill.findUnique({ where: { id: billId }, include: { session: true } });
    if (!bill) throw new BillNotFoundError();

    const updatedBill = await prisma.bill.update({
        where: { id: billId },
        data: { status: "paid", paymentMethod: paymentMethod as any, paidAt: new Date() },
    });

    emitBillStatusChanged(bill.session.sessionToken, billId, "paid");

    await prisma.tableSession.update({
        where: { id: bill.sessionId },
        data: { status: "closed", closedAt: new Date() },
    });

    // เปิดโต๊ะให้ว่างอีกครั้ง
    const session = await prisma.tableSession.findUnique({ where: { id: bill.sessionId } });
    if (session) {
        await prisma.table.update({ where: { id: session.tableId }, data: { status: "available" } });
    }

    return updatedBill;
}

// Staff ดูรายการที่พร้อมเสิร์ฟ
export async function getServingItems() {
    return prisma.orderItem.findMany({
        where: { status: "serving" },
        include: { session: { include: { table: true } } },
        orderBy: { cookingStartedAt: "asc" },
    });
}

// Staff เสิร์ฟเสร็จ
export async function markServed(orderItemId: number) {
    const orderItem = await prisma.orderItem.update({
        where: { id: orderItemId },
        data: { status: "served", servedAt: new Date() },
        include: { session: true },
    });

    emitOrderItemStatusChanged(orderItem.session.sessionToken, orderItemId, "served");
    return orderItem;
}