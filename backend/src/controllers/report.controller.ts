import { Request, Response } from "express";
import { getDailySales, getTopSellers, getCancellationRate } from "../services/report.service";

export async function getDailySalesController(req: Request, res: Response) {
    const startDate = req.query.startDate
        ? new Date(req.query.startDate as string)
        : new Date(new Date().setDate(new Date().getDate() - 30));
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();

    const sales = await getDailySales(startDate, endDate);
    res.json({ success: true, data: sales });
}

export async function getTopSellersController(req: Request, res: Response) {
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const sellers = await getTopSellers(limit);
    res.json({ success: true, data: sellers });
}

export async function getCancellationRateController(_req: Request, res: Response) {
    const rates = await getCancellationRate();
    res.json({ success: true, data: rates });
}