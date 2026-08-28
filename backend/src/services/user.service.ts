import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

export class UsernameTakenError extends Error {}

interface CreateUserInput {
    username: string;
    password: string;
    fullName: string;
    role: "chef" | "staff" | "admin";
}

interface UpdateUserInput {
    fullName?: string;
    role?: "chef" | "staff" | "admin";
}

export async function createUser(input: CreateUserInput) {
    const existing = await prisma.user.findUnique({ where: { username: input.username } });
    if (existing) {
        throw new UsernameTakenError();
    }

    const passwordHashed = await argon2.hash(input.password);

    const user = await prisma.user.create({
        data: {
            username: input.username,
            passwordHashed,
            fullName: input.fullName,
            role: input.role,
        },
    });

    const { passwordHashed: _, ...safeUser } = user;
    return safeUser;
}

export async function getAllUsers() {
    const users = await prisma.user.findMany({
        select: { id: true, username: true, fullName: true, role: true, isActive: true, createdAt: true },
        orderBy: { createdAt: "desc" },
    });
    return users;
}

export async function toggleUserActive(userId: number, isActive: boolean) {
    const user = await prisma.user.update({
        where: { id: userId },
        data: { isActive },
        select: { id: true, username: true, fullName: true, role: true, isActive: true },
    });
    return user;
}

export async function updateUser(userId: number, input: UpdateUserInput) {
    const user = await prisma.user.update({
        where: { id: userId },
        data: input,
        select: { id: true, username: true, fullName: true, role: true, isActive: true },
    });
    return user;
}