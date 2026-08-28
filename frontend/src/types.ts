export interface MenuItem {
    id: number;
    name: string;
    basePrice: string;
    isAvailable: boolean;
    category: { name: string };
    optionGroups?: OptionGroup[];
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

export interface Option {
    id: number;
    name: string;
    extraPrice: string;
}

export interface OptionGroup {
    id: number;
    name: string;
    selectionType: "single" | "multiple";
    isRequired: boolean;
    options: Option[];
}