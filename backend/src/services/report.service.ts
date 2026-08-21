import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getDailySales(startDate: Date, endDate: Date) {
    const bills = await prisma.bill.findMany({
        where: { status: "paid", paidAt: { gte: startDate, lt: endDate } },
        select: { amount: true, paidAt: true },
    });

    const salesByDate: Record<string, { totalRevenue: number; totalOrders: number }> = {};

    for (const bill of bills) {
        const dateKey = bill.paidAt?.toISOString().split("T")[0] ?? "unknown";
        const daySales = salesByDate[dateKey] ??= { totalRevenue: 0, totalOrders: 0 };

        daySales.totalRevenue += Number(bill.amount);
        daySales.totalOrders += 1;
    }

    return Object.entries(salesByDate)
        .map(([date, data]) => ({ date, ...data}))
        .sort((a, b) => a.date.localeCompare(b.date));
}

export async function getTopSellers(limit: number = 10) {
    const results = await prisma.orderItem.groupBy({
        by: ["menuItemId"],
        where: { status: "served" },
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: limit,
    });

    const menuItemIds = results.map((r) => r.menuItemId);
    const menuItems = await prisma.menuItem.findMany({
        where: { id: { in: menuItemIds } },
        select: { id: true, name: true },
    });

    return results.map((r) => ({
        menuItemId: r.menuItemId,
        name: menuItems.find((m) => m.id === r.menuItemId)?.name ?? "Unknown",
        totalQuantitySold: r._sum.quantity ?? 0,
    }));
}

export async function getCancellationRate() {
    const allItems = await prisma.orderItem.groupBy({
        by: ["menuItemId"],
        _count: { id: true },
    });

    const cancelledItems = await prisma.orderItem.groupBy({
        by: ["menuItemId"],
        where: { status: { in: ["cancelled_unnotified", "cancelled_notified"] } },
        _count: { id: true },
    });

    const menuItemIds = allItems.map((r) => r.menuItemId);
    const menuItems = await prisma.menuItem.findMany({
        where: { id: { in: menuItemIds } },
        select: { id: true, name: true },
    });

    return allItems
        .map((item) => {
            const cancelled = cancelledItems.find((c) => c.menuItemId === item.menuItemId);
            const cancelledCount = cancelled?._count.id ?? 0;
            const totalCount = item._count.id;
            return {
                menuItemId: item.menuItemId,
                name: menuItems.find((m) => m.id === item.menuItemId)?.name ?? "Unknown",
                totalOrdered: totalCount,
                cancelledCount,
                cancelRatePercent: totalCount > 0 ? Math.round((cancelledCount / totalCount) * 10000) / 100 : 0,
            };
        })
        .filter((item) => item.cancelledCount > 0)
        .sort((a, b) => b.cancelRatePercent - a.cancelRatePercent);
}