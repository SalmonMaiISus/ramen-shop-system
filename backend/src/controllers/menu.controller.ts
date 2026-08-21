import { Request, Response } from "express";
import { getAllMenuItems } from "../services/menu.service";

export async function getMenu(_req: Request, res: Response) {
    try {
        const menuItems = await getAllMenuItems();
        res.set("Cache-Control", "no-store");
        res.json({ success: true, data: menuItems });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: { code: "INTERNAL_ERROR", message: "Failed to fetch menu" },
        });
    }
}