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
    NoOrderItemsError,
    OrderItemsInProgressError,
    getUnassignedOrderItems,
    createSplitBill,
    forceCloseSession,
    NoUnassignedItemsError,
    SessionNotFoundError,
} from "../services/bill.service";
import { 
    getUnnotifiedCancellations, 
    markCancellationNotified,
    OrderItemNotFoundError,
     InvalidStatusTransitionError,
} from "../services/order.service";
import { payBillSchema, createSplitBillSchema } from "../utils/validators";

export async function requestBillController(req: SessionRequest, res: Response) {
    try {
        const result = await requestBill(req.session!.id);
        // result is { bill, created: boolean }
        if ((result as any).created) {
            return res.status(201).json({ success: true, data: (result as any).bill });
        }
        return res.status(200).json({ success: true, data: (result as any).bill });
    } catch (error) {
        if (error instanceof OrderItemsInProgressError) {
            return res.status(400).json({
                success: false,
                error: { code: "ORDER_ITEMS_IN_PROGRESS", message: "Some order items are still being prepared or served" },
            });
        }
        if (error instanceof NoOrderItemsError) {
            return res.status(400).json({
                success: false,
                error: { code: "NO_ORDER_ITEMS", message: "No order items to request bill for" },
            });
        }
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

export async function getUnnotifiedCancellationsController(_req: AuthRequest, res: Response) {
    const items = await getUnnotifiedCancellations();
    res.json({ success: true, data: items });
}

export async function markCancellationNotifiedController(req: AuthRequest, res: Response) {
    const orderItemId = Number(req.params.id);
    try {
        const item = await markCancellationNotified(orderItemId, req.user!.userId);
        res.json({ success: true, data: item });
    } catch (error) {
        if (error instanceof OrderItemNotFoundError) {
            return res.status(404).json({
                success: false,
                error: { code: "ORDER_ITEM_NOT_FOUND", message: "Order item not found" },
            });
        }
        if (error instanceof InvalidStatusTransitionError) {
            return res.status(409).json({
                success: false,
                error: { code: "INVALID_STATUS_TRANSITION", message: error.message },
            });
        }
        res.status(500).json({ success: false, error: { code: "INTERNAL_ERROR", message: "Error" } });
    }
}

export async function getUnassignedItemsController(req: AuthRequest, res: Response) {
    const sessionId = Number(req.params.sessionId);
    const items = await getUnassignedOrderItems(sessionId);
    res.json({ success: true, data: items });
}

export async function createSplitBillController(req: AuthRequest, res: Response) {
    const parsed = createSplitBillSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(422).json({
            success: false,
            error: { code: "VALIDATION_ERROR", message: "orderItemIds is required" },
        });
    }

    const sessionId = Number(req.params.sessionId);

    try {
        const bill = await createSplitBill(sessionId, parsed.data.orderItemIds);
        res.status(201).json({ success: true, data: bill });
    } catch (error) {
        if (error instanceof NoUnassignedItemsError) {
            return res.status(400).json({
                success: false,
                error: { code: "NO_UNASSIGNED_ITEMS", message: "No valid items selected" },
            });
        }
        res.status(500).json({ success: false, error: { code: "INTERNAL_ERROR", message: "Error" } });
    }
}

export async function forceCloseSessionController(req: AuthRequest, res: Response) {
    const sessionId = Number(req.params.sessionId);
    try {
        await forceCloseSession(sessionId);
        res.json({ success: true, data: null });
    } catch (error) {
        if (error instanceof SessionNotFoundError) {
            return res.status(404).json({
                success: false,
                error: { code: "SESSION_NOT_FOUND", message: "Session not found" },
            });
        }
        res.status(500).json({ success: false, error: { code: "INTERNAL_ERROR", message: "Error" } });
    }
}