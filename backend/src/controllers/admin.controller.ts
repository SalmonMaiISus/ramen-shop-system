import { Request, Response } from "express";
import {
    createMenuItem,
    getAllCategories,
    toggleMenuItemAvailability,
} from "../services/menu.service";
import { createMenuItemSchema, toggleAvailabilitySchema } from "../utils/validators";

export async function createMenuItemController(req: Request, res: Response) {
    const parsed = createMenuItemSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(422).json({
            success: false,
            error: {
                code: "VALIDATION_ERROR",
                message: "Invalid request body",
                details: parsed.error.flatten(),
            },
        });
    }

    try {
        const menuItem = await createMenuItem(parsed.data);
        res.status(201).json({ success: true, data: menuItem });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: { code: "INTERNAL_ERROR", message: "Failed to create menu item" },
        });
    }
}

export async function getCategoriesController(_req: Request, res: Response) {
    const categories = await getAllCategories();
    res.json({ success: true, data: categories });
}

export async function toggleAvailabilityController(req: Request, res: Response) {
    const parsed = toggleAvailabilitySchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(422).json({
            success: false,
            error: { code: "VALIDATION_ERROR", message: "isAvailable must be boolean" },
        });
    }

    const menuItemId = Number(req.params.id);
    const menuItem = await toggleMenuItemAvailability(menuItemId, parsed.data.isAvailable);
    res.json({ success: true, data: menuItem });
}