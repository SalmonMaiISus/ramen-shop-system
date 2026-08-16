import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class MenuItemNotFoundError extends Error { }
export class MenuItemUnavailableError extends Error { }

interface CreateOrderItemInput {
    menuItemId: number;
    quantity: number;
    selectedOptionIds: number[];
    specialNotes?: string;
}

export async function createOrderItems(sessionId: number, items: CreateOrderItemInput[]) {
    const results = [];

    for (const item of items) {
        const menuItem = await prisma.menuItem.findUnique({
            where: { id: item.menuItemId },
            include: { optionGroups: { include: { options: true } } },
        });

        if (!menuItem) {
            throw new MenuItemNotFoundError(`Menu item ${item.menuItemId} not found`);
        }
        if (!menuItem.isAvailable) {
            throw new MenuItemUnavailableError(`${menuItem.name} is currently unavailable`);
        }

        const allOptionsOfMenuItem = menuItem.optionGroups.flatMap((g) => g.options);
        const selectedOptions = allOptionsOfMenuItem.filter((opt) =>
            item.selectedOptionIds.includes(opt.id)
        );

        const orderItem = await prisma.orderItem.create({
            data: {
                sessionId,
                menuItemId: menuItem.id,
                menuItemNameSnapshot: menuItem.name,
                unitPriceSnapshot: menuItem.basePrice,
                quantity: item.quantity,
                specialNotes: item.specialNotes,
                status: "pending",
                selectedOptions: {
                    create: selectedOptions.map((opt) => ({
                        optionId: opt.id,
                        optionNameSnapshot: opt.name,
                        extraPriceSnapshot: opt.extraPrice,
                    })),
                },
            },
            include: { selectedOptions: true },
        });

        results.push(orderItem);
    }

    return results;
}

export class OrderItemNotFoundError extends Error {}
export class InvalidStatusTransitionError extends Error {}

export async function getKitchenQueue() {
    return prisma.orderItem.findMany({
        where: { status: { in: ["pending", "cooking"] } },
        include: {
            menuItem: { include: { category: true } },
            session: { include: { table: true } },
            selectedOptions: true,
        },
        orderBy: [
            { menuItem: { category: { displayOrder: "asc" } } },
            { queuePosition: "asc" },
            { createdAt: "asc" },
        ],
    });
}

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
    pending: ["cooking"],
    cooking: ["serving"],
    serving: ["served"],
}

export async function updateOrderItemStatus(orderItemId: number, newStatus: string) {
    const orderItem = await prisma.orderItem.findUnique({ where: { id: orderItemId } });

    if (!orderItem) {
        throw new OrderItemNotFoundError();
    }

    // ไม่สามารถข้ามขั้นได้ ต้องทำตามขั้นตอน pending => cooking => serving => served
    const allowedNextStatuses = ALLOWED_TRANSITIONS[orderItem.status] ?? [];
    if (!allowedNextStatuses.includes(newStatus)) {
        throw new InvalidStatusTransitionError(
            `Cannot change status from ${orderItem.status} to ${newStatus}`
        );
    }

    const timestampField = newStatus === "cooking" ? "cookingStartedAt" : newStatus === "served" ? "servedAt" : null;

    return prisma.orderItem.update({
        where: { id: orderItemId },
        data: { status: newStatus as any, ...(timestampField ? { [timestampField]: new Date() } : {}), },
    });
}