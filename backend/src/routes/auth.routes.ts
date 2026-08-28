import { Router } from "express";
import { loginController, refreshController, logoutController } from "../controllers/auth.controller";
import { requireAuth, AuthRequest } from "../middlewares/auth.middleware";
import { getUserById } from "../services/auth.service";

const router = Router();

router.post("/login", loginController);
router.post("/refresh", refreshController);
router.post("/logout", logoutController);

router.get("/me", requireAuth, async (req: AuthRequest, res) => {
    const user = await getUserById(req.user!.userId);
    if (!user) {
        return res.status(404).json({ success: false, error: { code: "USER_NOT_FOUND", message: "User not found" } });
    }
    res.json({ success: true, data: user });
});

export default router;