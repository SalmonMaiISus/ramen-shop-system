export interface MenuItem {
    id: number;
    name: string;
    basePrice: string;
    isAvailable: boolean;
    category: { name: string };
}

export interface OrderItem {
    id: number;
    menuItemNameSnapshot: string;
    unitPriceSnapshot: string;
    status: string;
    createdAt: string;
    session: { table: { tableNumber: string } };
}

export interface User {
    id: number;
    username: string;
    fullName: string;
    role: string;
}