import jwt from "jsonwebtoken";

interface JwtPayLoad {
    userId: number;
    role: string;
}

export function signAccessToken(payload: JwtPayLoad): string {
    return jwt.sign(payload, process.env.JWT_ACCESS_SECRET as string, {
        expiresIn: "15m",
    });
}

export function signRefreshToken(payload: JwtPayLoad): string {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET as string, {
        expiresIn: "7d",
    });
}

export function verifyAccessToken(token: string): JwtPayLoad {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET as string) as JwtPayLoad;
}