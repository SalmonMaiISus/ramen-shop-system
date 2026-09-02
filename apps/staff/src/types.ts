export interface User {
    id: number;
    username: string;
    fullName: string;
    role: "chef" | "staff" | "admin";
}

export interface OrderItem {
    id: number;
    menuItemNameSnapshot: string;
    status: string;
    createdAt: string;
    cancelReason?: string;
    session: { table: { tableNumber: string } };
}

export interface Bill {
    id: number;
    amount: string;
    status: string;
    session: { table: { tableNumber: string } };
}

export interface SessionData {
    id: number;
    table: { tableNumber: string };
}

export interface MenuItem {
    id: number;
    name: string;
    basePrice: string;
    imageUrl?: string | null;
    isAvailable: boolean;
    category: { id: number; name: string };
    optionGroups: { id: number; name: string; selectionType: string; options: { id: number; name: string; extraPrice: string }[] }[];
}

export interface Category {
    id: number;
    name: string;
}

export interface TableData {
    id: number;
    tableNumber: string;
    qrCodeToken: string;
    status: string;
}

export interface StaffUser {
    id: number;
    username: string;
    fullName: string;
    role: string;
    isActive: boolean;
}