import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient();

export async function getAllMenuItems() {
    return prisma.menuItem.findMany({
        where: { isHidden: false },
        include: {
            category: true,
            optionGroups: { include: { options: true } },
        },
        orderBy: { category: { displayOrder: "asc" } },
    });
}