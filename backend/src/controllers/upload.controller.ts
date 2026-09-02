import { Request, Response } from "express";

export function uploadImageController(req: Request, res: Response) {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            error: { code: "NO_FILE", message: "No file uploaded" },
        });
    }
    const imageUrl = `http://localhost:4000/uploads/${req.file.filename}`;
        res.status(201).json({ success: true, data: { imageUrl } });
}