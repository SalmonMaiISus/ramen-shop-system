import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

export class TableNumberTakenError extends Error { }

export async function createTable(tableNumber: string) {
    const existing = await prisma.table.findUnique({ where: { tableNumber } });
    if (existing) {
        throw new TableNumberTakenError();
    }

    return prisma.table.create({
        data: {
            tableNumber,
            qrCodeToken: crypto.randomBytes(16).toString("hex"),
        },
    });
}

export async function getAllTables() {
    return prisma.table.findMany({ orderBy: { tableNumber: "asc" } });
}

export async function deleteTable(tableId: number) {
    await prisma.table.delete({ where: { id: tableId } });
}

export async function getActiveSessions() {
    return prisma.tableSession.findMany({
        where: { status: { not: "closed"} },
        include: { table: true },
        orderBy: { openedAt: "asc" },
    })
}