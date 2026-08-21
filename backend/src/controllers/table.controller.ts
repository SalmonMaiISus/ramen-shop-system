import { Request, Response } from "express";
import { createTable, getAllTables, deleteTable, TableNumberTakenError } from "../services/table.service";
import { createTableSchema } from "../utils/validators";

export async function createTableController(req: Request, res: Response) {
    const parsed = createTableSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(422).json({
            success: false,
            error: { code: "VALIDATION_ERROR", message: "Table number is required" },
        });
    }

    try {
        const table = await createTable(parsed.data.tableNumber);
        res.status(201).json({ success: true, data: table });
    } catch (error) {
        if (error instanceof TableNumberTakenError) {
            return res.status(409).json({
                success: false,
                error: { code: "TABLE_NUMBER_TAKEN", message: "This table number already exists" },
            });
        }
        res.status(500).json({ success: false, error: { code: "INTERNAL_ERROR", message: "Error" } });
    }
}

export async function getAllTablesController(_req: Request, res: Response) {
    const tables = await getAllTables();
    res.json({ success: true, data: tables });
}

export async function deleteTableController(req: Request, res: Response) {
    const tableId = Number(req.params.id);
    try {
        await deleteTable(tableId);
        res.json({ success: true, data: null });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: { code: "INTERNAL_ERROR", message: "Cannot delete table (may have active sessions)" },
        });
    }
}