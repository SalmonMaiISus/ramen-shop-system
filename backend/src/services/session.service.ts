import { PrismaClient } from "@prisma/client";
import { generateSessionToken } from "../utils/token";

const prisma = new PrismaClient();

export class TableNotFoundError extends Error {}

export async function scanQrCode(qrCodeToken: string) {
    const table = await prisma.table.findUnique({ where: { qrCodeToken } });

    if (!table) {
        throw new TableNotFoundError();
    }

    const existingSession = await prisma.tableSession.findFirst({
        where: { tableId: table.id, status: { not: "closed" } },
    });

    if (existingSession) {
        return { sessionToken: existingSession.sessionToken, tableNumber: table.tableNumber };
    }

    const newSession = await prisma.tableSession.create({
        data: {
            tableId: table.id,
            sessionToken: generateSessionToken(),
            status: "open",
        },
    });

    await prisma.table.update({
        where: { id: table.id},
        data: { status: "occupied" },
    });

    return { sessionToken: newSession.sessionToken, tableNumber: table.tableNumber };
}