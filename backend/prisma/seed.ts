import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding database...");

    // Admin User
    const passwordHashed = await argon2.hash("password123");
    await prisma.user.upsert({
        where: { username: "admin" },
        update: {},
        create: {
            username: "admin",
            passwordHashed,
            fullName: "System Admin",
            role: "admin",
        },
    });

    // Menu categories
    const ramenCategory = await prisma.menuCategory.create({
        data: { name: "ราเมง", displayOrder: 1 },
    });

     // Menu Items
    const shoyuRamen = await prisma.menuItem.create({
        data: {
            categoryId: ramenCategory.id,
            name: "ราเมงหมูชาชู",
            basePrice: 120.0,
            isAvailable: true,
        },
    });

    await prisma.optionGroup.create({
        data: {
            menuItemId: shoyuRamen.id,
            name: "ระดับความเผ็ด",
            selectionType: "single",
            isRequired: true,
            options: {
                create: [
                { name: "ไม่เผ็ด", extraPrice: 0 },
                { name: "เผ็ดมาก", extraPrice: 0 },
                ],
            },
        },
    });

    // Sample Table
    await prisma.table.create({
        data: { tableNumber: "A1", qrCodeToken: "qr-token-a1-sample" },
    });

    console.log("✅ Seed completed");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });