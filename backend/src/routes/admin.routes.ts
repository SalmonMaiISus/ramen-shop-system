import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";
import {
    createMenuItemController,
    getCategoriesController,
    toggleAvailabilityController,
} from "../controllers/admin.controller";

const router = Router();

router.use(requireAuth, requireRole("admin"));

router.get("/categories", getCategoriesController);
router.post("/menu-items", createMenuItemController);
router.patch("/menu-items/:id/availability", toggleAvailabilityController);

export default router;