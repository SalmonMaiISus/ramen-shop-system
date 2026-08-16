import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface SessionRequest extends Request {
    session?: { id: number; tableId: number };
}

export async function requireSession(req: SessionRequest, res: Response, next: NextFunction) {
    const sessionToken = req.headers["x-session-token"] as string | undefined;

    if (!sessionToken) {
        return res.status(401).json({
            success: false,
            error: { code: "UNAUTHORIZED", message: "Missing session token" },
        });
    }

    const session = await prisma.tableSession.findUnique({ where: { sessionToken } });

    if (!session || session.status == "closed") {
        return res.status(401).json({
            success: false,
            error: { code: "SESSION_INVALID", message: "Session not found or already closed" },
        });
    }

    req.session = { id: session.id, tableId: session.tableId };
    next();
}
