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

export interface MenuItem {
    id: number;
    name: string;
    description: string | null;
    basePrice: string;
    imageUrl: string | null;
    isAvailable: boolean;
    category: { id: number; name: string };
    optionGroups: OptionGroup[];
}

export interface CartItem {
    key: string;
    menuItemId: number;
    name: string;
    unitPrice: number;
    quantity: number;
    selectedOptionIds: number[];
    optionsLabel: string;
    specialNotes?: string;
}

export interface MyOrderItem {
    id: number;
    menuItemNameSnapshot: string;
    unitPriceSnapshot: string;
    status: string;
}

export interface MyBill {
    id: number;
    amount: string;
    status: string;
}