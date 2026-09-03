import { Request, Response } from "express";

export function uploadImageController(req: Request, res: Response) {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            error: { code: "NO_FILE", message: "No file uploaded" },
        });
    }

    const imageUrl = (req.file as any).path;
    res.status(201).json({ success: true, data: { imageUrl } });
}