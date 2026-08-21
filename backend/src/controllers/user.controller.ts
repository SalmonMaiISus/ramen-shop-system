import { Request, Response } from "express";
import { createUser, getAllUsers, toggleUserActive, UsernameTakenError } from "../services/user.service";
import { createUserSchema } from "../utils/validators";
import { z } from "zod";

const toggleActiveSchema = z.object({ isActive: z.boolean() });

export async function createUserController(req: Request, res: Response) {
    const parsed = createUserSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(422).json({
            success: false,
            error: { code: "VALIDATION_ERROR", message: "Invalid user data", details: parsed.error.flatten() },
        });
    }

    try {
        const user = await createUser(parsed.data);
        res.status(201).json({ success: true, data: user });
    } catch (error) {
        if (error instanceof UsernameTakenError) {
            return res.status(409).json({
                success: false,
                error: { code: "USERNAME_TAKEN", message: "This username is already taken" },
            });
        }
        res.status(500).json({ success: false, error: { code: "INTERNAL_ERROR", message: "Error" } });
    }
}

export async function getAllUsersController(_req: Request, res: Response) {
    const users = await getAllUsers();
    res.json({ success: true, data: users });
}

export async function toggleUserActiveController(req: Request, res: Response) {
    const parsed = toggleActiveSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(422).json({
            success: false,
            error: { code: "VALIDATION_ERROR", message: "isActive must be boolean" },
        });
    }

    const userId = Number(req.params.id);
    const user = await toggleUserActive(userId, parsed.data.isActive);
    res.json({ success: true, data: user });
}