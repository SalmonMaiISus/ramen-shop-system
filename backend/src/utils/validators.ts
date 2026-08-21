import { z } from "zod";

export const loginSchema = z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required"),
});

export const scanQrSchema = z.object({
    qrCodeToken: z.string().min(1, "QR code token is required"),
});

export const createOrderItemScehma = z.object({
    items: z.array(
        z.object({
            menuItemId: z.number().int().positive(),
            quantity: z.number().int().positive().default(1),
            selectedOptionIds: z.array(z.number().int().positive()).default([]),
            specialNotes: z.string().optional(),
        })
    ).min(1, "At least one item is required"),
});

export const updateStatusSchema = z.object({
    status: z.enum(["cooking", "serving", "served"]),
});

export const payBillSchema = z.object({
    paymentMethod: z.enum(["cash", "qr_promptpay", "credit_card"]),
});

export const createMenuItemSchema = z.object({
    categoryId: z.number().int().positive(),
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    basePrice: z.number().positive("Price must be greater than 0"),
    imageUrl: z.string().optional(),
});

export const toggleAvailabilitySchema = z.object({
    isAvailable: z.boolean(),
});

export const cancelOrderItemSchema = z.object({
    reason: z.string().min(1, "Cancellation reason is required"),
});

export const createTableSchema = z.object({
    tableNumber: z.string().min(1, "Table number is required"),
});

export const createUserSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    fullName: z.string().min(1, "Full name is required"),
    role: z.enum(["chef", "staff", "admin"]),
});