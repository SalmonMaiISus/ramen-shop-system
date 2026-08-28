import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient();

export class MenuItemNotFoundErrorAdmin extends Error {}
export class CategoryNotFoundError extends Error {}

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

interface UpdateMenuItemInput {
    name?: string;
    description?: string;
    basePrice?: number;
    categoryId?: number;
    imageUrl?: string;
}

interface CreateOptionGroupInput {
    menuItemId: number;
    name: string;
    selectionType: "single" | "multiple";
    isRequired: boolean;
}

interface CreateOptionInput {
    optionGroupId: number;
    name: string;
    extraPrice: number;
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

export async function updateMenuItem(menuItemId: number, input: UpdateMenuItemInput) {
    const existing = await prisma.menuItem.findUnique({ where: { id: menuItemId } });
    if (!existing) throw new MenuItemNotFoundErrorAdmin();

    return prisma.menuItem.update({
        where: { id: menuItemId },
        data: input,
    });
}

// Soft delete
export async function hideMenuItem(menuItemId: number) {
    const existing = await prisma.menuItem.findUnique({ where: { id: menuItemId } });
    if (!existing) throw new MenuItemNotFoundErrorAdmin();

    return prisma.menuItem.update({
        where: { id: menuItemId },
        data: { isHidden: true, isAvailable: false },
    });
}

export async function createOptionGroup(input: CreateOptionGroupInput) {
    return prisma.optionGroup.create({ data: input });
}

export async function deleteOptionGroup(optionGroupId: number) {
    await prisma.optionGroup.delete({ where: { id: optionGroupId } });
}

export async function createOption(input: CreateOptionInput) {
    return prisma.option.create({ data: input });
}

export async function deleteOption(optionId: number) {
    await prisma.option.delete({ where: { id: optionId } });
}

export async function createCategory(name: string, displayOrder: number) {
    return prisma.menuCategory.create({ data: { name, displayOrder } });
}

export async function updateCategory(categoryId: number, name?: string, displayOrder?: number) {
    const existing = await prisma.menuCategory.findUnique({ where: { id: categoryId } });
    if (!existing) throw new CategoryNotFoundError();

    return prisma.menuCategory.update({
        where: { id: categoryId },
        data: { ...(name && { name }), ...(displayOrder !== undefined && { displayOrder }) },
    });
}

export async function deleteCategory(categoryId: number) {
    const menuItemCount = await prisma.menuItem.count({ where: { categoryId } });
    if (menuItemCount > 0) {
        throw new Error("Cannot delete category that still has menu items");
    }
    await prisma.menuCategory.delete({ where: { id: categoryId } });
}