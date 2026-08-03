import { Router } from "express";
import { loginController } from "../controllers/auth.controller";
import { requireAuth, AuthRequest } from "../middlewares/auth.middleware";
import { Response } from "express";

const router = Router();

router.post("/login", loginController);

router.get("/me", requireAuth, (req: AuthRequest, res: Response) => {
    res.json({ success: true, data: { userId: req.user?.userId, role: req.user?.role} });
});

export default router;