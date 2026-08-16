import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class SessionNotFoundError extends Error { }
export class BillNotFoundError extends Error { }

// Customer กดเรียกเก็บเงิน
export async function requestBill(sessionId: number) {
    const orderItems = await prisma.orderItem.findMany({
        where: {
            sessionId,
            status: { not: { in: ["cancelled_unnotified", "cancelled_notified"] } },
        },
    });

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

    return bill;
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
    const bill = await prisma.bill.findUnique({ where: { id: billId } });
    if (!bill) throw new BillNotFoundError();

    return prisma.bill.update({
        where: { id: billId },
        data: { status: "coming", handledBy: staffUserId, attendedAt: new Date() },
    });
}

// Staff ยืนยันจ่ายเงินแล้ว + ปิด session
export async function markBillPaid(billId: number, paymentMethod: string) {
    const bill = await prisma.bill.findUnique({ where: { id: billId } });
    if (!bill) throw new BillNotFoundError();

    const updatedBill = await prisma.bill.update({
        where: { id: billId },
        data: { status: "paid", paymentMethod: paymentMethod as any, paidAt: new Date() },
    });

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
    return prisma.orderItem.update({
        where: { id: orderItemId },
        data: { status: "served", servedAt: new Date() },
    });
}