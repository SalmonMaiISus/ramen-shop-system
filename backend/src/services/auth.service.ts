import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";

const prisma = new PrismaClient();

export class InvalidCredentialsError extends Error {}
export class InvalidRefreshTokenError extends Error {}

export async function login(username: string, password: string) {
    const user = await prisma.user.findUnique({ where: { username } });

    if(!user || !user.isActive) {
        throw new InvalidCredentialsError();
    }

    const isPasswordValid = await argon2.verify(user.passwordHashed, password);
    if (!isPasswordValid) {
        throw new InvalidCredentialsError();
    }

    const payload = { userId: user.id, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    return {
        accessToken,
        refreshToken,
        expiresIn: 900,
        user: { id: user.id, username: user.username, fullName: user.fullName, role: user.role },
    }
}

export async function refreshAccessToken(refreshToken: string) {
    let payload;
    try {
        payload = verifyRefreshToken(refreshToken);
    } catch {
        throw new InvalidRefreshTokenError();
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user || !user.isActive) {
        throw new InvalidRefreshTokenError();
    }

    const newAccessToken = signAccessToken({ userId: user.id, role: user.role });
    return { accessToken: newAccessToken, expiresIn: 900 };
}

export async function getUserById(userId: number) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return null;
    return { id: user.id, username: user.username, fullName: user.fullName, role: user.role };
}