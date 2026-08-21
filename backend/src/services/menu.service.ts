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

interface CreateMenuItemInput {
    categoryId: number;
    name: string;
    description?: string | undefined;
    basePrice: number;
    imageUrl?: string | undefined;
}

export async function createMenuItem(input: CreateMenuItemInput) {
    return prisma.menuItem.create({
        data: {
            categoryId: input.categoryId,
            name: input.name,
            ...(input.description !== undefined ? { description: input.description } : {}),
            basePrice: input.basePrice,
            ...(input.imageUrl !== undefined ? { imageUrl: input.imageUrl } : {}),
            isAvailable: true,
            isHidden: false,
        },
    });
}

export async function getAllCategories() {
    return prisma.menuCategory.findMany({ orderBy: { displayOrder: "asc" } });
}

export async function toggleMenuItemAvailability(menuItemId: number, isAvailable: boolean) {
    return prisma.menuItem.update({
        where: { id: menuItemId },
        data: { isAvailable },
    });
}