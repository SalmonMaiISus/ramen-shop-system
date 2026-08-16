import { Response } from "express";
import { SessionRequest } from "../middlewares/session.middleware";
import { AuthRequest } from "../middlewares/auth.middleware";
import {
    requestBill,
    getPendingBills,
    markBillComing,
    markBillPaid,
    getServingItems,
    markServed,
    BillNotFoundError,
} from "../services/bill.service";
import { payBillSchema } from "../utils/validators";

export async function requestBillController(req: SessionRequest, res: Response) {
    try {
        const bill = await requestBill(req.session!.id);
        res.status(201).json({ success: true, data: bill });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: { code: "INTERNAL_ERROR", message: "Failed to request bill" },
        });
    }
}

export async function getPendingBillsController(_req: AuthRequest, res: Response) {
    const bills = await getPendingBills();
    res.json({ success: true, data: bills });
}

export async function markBillComingController(req: AuthRequest, res: Response) {
    const billId = Number(req.params.id);
    try {
        const bill = await markBillComing(billId, req.user!.userId);
        res.json({ success: true, data: bill });
    } catch (error) {
        if (error instanceof BillNotFoundError) {
            return res.status(404).json({
                success: false,
                error: { code: "BILL_NOT_FOUND", message: "Bill not found" },
            });
        }
        res.status(500).json({ success: false, error: { code: "INTERNAL_ERROR", message: "Error" } });
    }
}

export async function markBillPaidController(req: AuthRequest, res: Response) {
    const parsed = payBillSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(422).json({
            success: false,
            error: { code: "VALIDATION_ERROR", message: "Invalid payment method" },
        });
    }

    const billId = Number(req.params.id);
    try {
        const bill = await markBillPaid(billId, parsed.data.paymentMethod);
        res.json({ success: true, data: bill });
    } catch (error) {
        if (error instanceof BillNotFoundError) {
            return res.status(404).json({
                success: false,
                error: { code: "BILL_NOT_FOUND", message: "Bill not found" },
            });
        }
        res.status(500).json({ success: false, error: { code: "INTERNAL_ERROR", message: "Error" } });
    }
}

export async function getServingItemsController(_req: AuthRequest, res: Response) {
    const items = await getServingItems();
    res.json({ success: true, data: items });
}

export async function markServedController(req: AuthRequest, res: Response) {
    const orderItemId = Number(req.params.id);
    const item = await markServed(orderItemId);
    res.json({ success: true, data: item });
}