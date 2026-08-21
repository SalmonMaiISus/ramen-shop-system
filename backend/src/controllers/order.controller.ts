import { Response } from "express";
import { SessionRequest } from "../middlewares/session.middleware";
import { createOrderItems, MenuItemNotFoundError, MenuItemUnavailableError, getMyOrderItems, } from "../services/order.service";
import { createOrderItemScehma } from "../utils/validators";
import { Request } from "express";
import { 
    getKitchenQueue,
    updateOrderItemStatus,
    OrderItemNotFoundError,
    InvalidStatusTransitionError,
    cancelOrderItem,
} from "../services/order.service";
import { updateStatusSchema, cancelOrderItemSchema } from "../utils/validators";

export async function createOrderItemsController(req: SessionRequest, res: Response) {
    const parsed = createOrderItemScehma.safeParse(req.body);

    if (!parsed.success) {
        return res.status(422).json({
            success: false,
            error: { code: "VALIDATION_ERROR", message: "Invalid request body" },
        });
    }

    try {
        const orderItems = await createOrderItems(req.session!.id, parsed.data.items);
        res.status(201).json({ success: true, data: { orderItems } });
    } catch (error) {
        if (error instanceof MenuItemNotFoundError) {
            return res.status(404).json({
                success: false,
                error: { code: "MENU_ITEM_NOT_FOUND", message: error.message },
            });
        }
        if (error instanceof MenuItemUnavailableError) {
            return res.status(409).json({
                success: false,
                error: { code: "MENU_ITEM_UNAVAILABLE", message: error.message },
            });
        }
        console.error(error);
        res.status(500).json({
            success: false,
            error: { code: "INTERNAL_ERROR", message: "Something went wrong"},
        });
    } 
}

export async function getKitchenQueueController(_req: Request, res: Response) {
    try {
        const orderItems = await getKitchenQueue();
        res.json({ success: true, data: orderItems });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: { code: "INTERNAL_ERROR", message: "Failed to fetch kitchen queue" },
        });
    }
}

export async function updateOrderItemStatusController(req: Request, res: Response) {
    const parsed = updateStatusSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(422).json({
            success: false,
            error: { code: "VALIDATION_ERROR", message: "Invalid status value" },
        });
    }

    const orderItemId = Number(req.params.id);

    try {
        const updated = await updateOrderItemStatus(orderItemId, parsed.data.status);
        res.json({ success: true, data: updated});
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
        console.error(error);
        res.status(500).json({
            success: false,
            error: { code: "INTERNAL_ERROR", message: "Something went wrong" },
        });
    }
}

export async function getMyOrderItemsController(req: SessionRequest, res: Response) {
    try {
        const orderItems = await getMyOrderItems(req.session!.id);
        res.json({ success: true, data: orderItems });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch order items"},
        });
    }
}

export async function cancelOrderItemController(req: Request, res: Response) {
    const parsed = cancelOrderItemSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(422).json({
            success: false,
            error: { code: "VALIDATION_ERROR", message: "Cancellation reason is required" },
        });
    }

    const orderItemId = Number(req.params.id);

    try {
        const cancelled = await cancelOrderItem(orderItemId, parsed.data.reason);
        res.json({ success: true, data: cancelled });
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
        console.error(error);
        res.status(500).json({
            success: false,
            error: { code: "INTERNAL_ERROR", message: "Something went wrong" },
        });
    }
}