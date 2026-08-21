import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";

export interface AuthRequest extends Request {
    user?: { userId: number; role: string };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            error: { code: "UNAUTHORIZED", message: "Missing or invalid token" },
        });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            error: { code: "UNAUTHORIZED", message: "Missing or invalid token" },
        });
    }

    try {
        const payload = verifyAccessToken(token);
        req.user = payload;
        next();
    } catch {
        return res.status(401).json({
            success: false,
            error: { code: "UNAUTHORIZED", message: "Token expired or invalid" },
        });
    }
}

// ใช้ต่อจาก requireAuth เพื่อเช็ค role เฉพาะ (RBAC)
export function requireRole(...allowedRoles: string[]) {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: { code: "FORBIDDEN", message: "You don't have permission for this action" },
            });
        }
        next();
    };
}