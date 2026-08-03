import { Request, Response } from "express";
import { scanQrCode, TableNotFoundError } from "../services/session.service";
import { scanQrSchema } from "../utils/validators";

export async function scanQr(req: Request, res: Response) {
    const parsed = scanQrSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(422).json({
            success: false,
            error: { code: "VALIDATION_ERROR", message: "Invalid request body" },
        });
    }

    try {
        const result = await scanQrCode(parsed.data.qrCodeToken);
        res.status(201).json({ success: true, data: result });
    } catch (error) {
        if (error instanceof TableNotFoundError) {
            return res.status(404).json({
                success: false,
                error: { code: "TABLE_NOT_FOUND", message: "Invalid QR code" },
            });
        }
        console.error(error);
        res.status(500).json({
            success: false,
            error: { code: "INTERNAL_ERROR", message: "Something went wrong" },
        });
    }
}