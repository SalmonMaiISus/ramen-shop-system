import { Request, Response } from "express";
import { getAllMenuItems } from "../services/menu.service";

export async function getMenu(_req: Request, res: Response) {
    try {
        const menuItems = await getAllMenuItems();
        res.json({ success: true, date: menuItems });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: { code: "INTERNAL_ERROR", message: "Failed to fetch menu" },
        });
    }
}