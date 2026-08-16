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